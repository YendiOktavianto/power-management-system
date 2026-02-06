import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, type FindOptionsWhere } from 'typeorm';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

import { User, UserRole, UserStatus } from '../../database/entities/user.entity';
import { Organization, OrganizationType } from '../../database/entities/organization.entity';
import {
  OrganizationMember,
  OrganizationMemberRole,
  OrganizationMemberStatus,
} from '../../database/entities/organization-member.entity';
import {
  AccountInvite,
  AccountInviteChannel,
  AccountInvitePurpose,
} from '../../database/entities/account-invite.entity';
import {
  AuditAction,
  AuditLog,
  AuditLogStatus,
  AuditTargetType,
} from '../../database/entities/audit-log.entity';

import { CreatePrincipalDto } from './dto/create-principal.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';

type ActorContext = {
  userId: string;
  orgId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

type ProvisioningResult = {
  userId: string;
  orgId: string;
  roleInOrg: OrganizationMemberRole;
  status: UserStatus;
  inviteSentTo: string;
  inviteToken?: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizations: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private readonly organizationMembers: Repository<OrganizationMember>,
    @InjectRepository(AccountInvite)
    private readonly accountInvites: Repository<AccountInvite>,
    @InjectRepository(AuditLog)
    private readonly auditLogs: Repository<AuditLog>,
    private readonly dataSource: DataSource,
  ) {}

  async createPrincipal(dto: CreatePrincipalDto, actor: ActorContext): Promise<ProvisioningResult> {
    await this.assertAdminOrOwner(actor.userId);
    const parentOrg = await this.assertParentOrg(dto.parentOrgId, OrganizationType.OWNER);
    return this.provisionUser({
      actor,
      dto,
      parentOrg,
      orgType: OrganizationType.PRINCIPAL,
      roleInOrg: OrganizationMemberRole.PRINCIPAL,
    });
  }

  async createCompany(dto: CreateCompanyDto, actor: ActorContext): Promise<ProvisioningResult> {
    await this.assertAdminOrOwner(actor.userId);
    const parentOrg = await this.assertParentOrg(dto.parentOrgId, OrganizationType.PRINCIPAL);
    return this.provisionUser({
      actor,
      dto,
      parentOrg,
      orgType: OrganizationType.COMPANY,
      roleInOrg: OrganizationMemberRole.COMPANY,
    });
  }

  async createCustomer(dto: CreateCustomerDto, actor: ActorContext): Promise<ProvisioningResult> {
    const parentOrg = await this.assertParentOrg(dto.parentOrgId, OrganizationType.COMPANY);
    await this.assertCompanyMember(actor.userId, parentOrg.orgId);
    const resolvedActor = { ...actor, orgId: actor.orgId ?? parentOrg.orgId };
    return this.provisionUser({
      actor: resolvedActor,
      dto,
      parentOrg,
      orgType: OrganizationType.CUSTOMER,
      roleInOrg: OrganizationMemberRole.CUSTOMER,
    });
  }

  private async assertAdminOrOwner(actorUserId: string): Promise<void> {
    const actor = await this.users.findOne({ where: { userId: actorUserId } });
    if (!actor) {
      throw new BadRequestException('Actor user not found.');
    }
    if (actor.role === UserRole.ADMIN) {
      return;
    }
    const ownerMember = await this.organizationMembers.findOne({
      where: { userId: actorUserId, roleInOrg: OrganizationMemberRole.OWNER },
    });
    if (!ownerMember) {
      throw new ForbiddenException('Only ADMIN/OWNER can perform this action.');
    }
  }

  private async assertCompanyMember(actorUserId: string, orgId: string): Promise<void> {
    const member = await this.organizationMembers.findOne({
      where: { userId: actorUserId, orgId, roleInOrg: OrganizationMemberRole.COMPANY },
    });
    if (!member) {
      throw new ForbiddenException('Only COMPANY can create CUSTOMER under this org.');
    }
  }

  private async assertParentOrg(
    orgId: string,
    expectedType: OrganizationType,
  ): Promise<Organization> {
    const parent = await this.organizations.findOne({ where: { orgId } });
    if (!parent) {
      throw new UnprocessableEntityException('parentOrgId not found.');
    }
    if (parent.type !== expectedType) {
      throw new UnprocessableEntityException(`parentOrgId must be ${expectedType}.`);
    }
    return parent;
  }

  private async provisionUser(input: {
    actor: ActorContext;
    dto: CreatePrincipalDto | CreateCompanyDto | CreateCustomerDto;
    parentOrg: Organization;
    orgType: OrganizationType;
    roleInOrg: OrganizationMemberRole;
  }): Promise<ProvisioningResult> {
    const { actor, dto, parentOrg, orgType, roleInOrg } = input;

    await this.assertUniqueUser(dto.email, dto.username, dto.phoneNumber);

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(inviteToken).digest('hex');
    const tempPassword = await argon2.hash(`INVITE:${inviteToken}:${Date.now()}`);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return this.dataSource.transaction(async (manager) => {
      const usersRepo = manager.getRepository(User);
      const orgRepo = manager.getRepository(Organization);
      const memberRepo = manager.getRepository(OrganizationMember);
      const inviteRepo = manager.getRepository(AccountInvite);
      const auditRepo = manager.getRepository(AuditLog);

      const user = usersRepo.create({
        username: dto.username,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        passwordHash: tempPassword,
        role: UserRole.USER,
        status: UserStatus.INACTIVE,
      });
      await usersRepo.save(user);

      const org = orgRepo.create({
        name: dto.orgName,
        type: orgType,
        parentId: parentOrg.orgId,
        isActive: true,
      });
      await orgRepo.save(org);

      const member = memberRepo.create({
        orgId: org.orgId,
        userId: user.userId,
        roleInOrg,
        status: OrganizationMemberStatus.INACTIVE,
      });
      await memberRepo.save(member);

      const invite = inviteRepo.create({
        userId: user.userId,
        createdByUserId: actor.userId,
        orgId: org.orgId,
        purpose: AccountInvitePurpose.SET_PASSWORD,
        tokenHash,
        expiresAt,
        channel: AccountInviteChannel.EMAIL,
        sentTo: dto.email,
        ip: actor.ip ?? null,
        userAgent: actor.userAgent ?? null,
      });
      await inviteRepo.save(invite);

      const audit = auditRepo.create({
        actorUserId: actor.userId,
        actorOrgId: actor.orgId ?? null,
        action: AuditAction.AUTH_ACCOUNT_INVITE_CREATED,
        targetType: AuditTargetType.ACCOUNT_INVITE,
        targetId: invite.inviteId,
        status: AuditLogStatus.SUCCESS,
        ip: actor.ip ?? null,
        userAgent: actor.userAgent ?? null,
        metadata: {
          createdUserId: user.userId,
          createdOrgId: org.orgId,
          roleInOrg,
        },
      });
      await auditRepo.save(audit);

      const result: ProvisioningResult = {
        userId: user.userId,
        orgId: org.orgId,
        roleInOrg,
        status: user.status,
        inviteSentTo: invite.sentTo,
      };

      if (process.env.INVITE_DEBUG === 'true') {
        result.inviteToken = inviteToken;
      }

      return result;
    });
  }

  private async assertUniqueUser(
    email: string,
    username: string,
    phoneNumber?: string,
  ): Promise<void> {
    const where: FindOptionsWhere<User>[] = [{ email }, { username }];
    if (phoneNumber) {
      where.push({ phoneNumber });
    }
    const existing = await this.users.findOne({ where, select: { userId: true } });
    if (existing) {
      throw new ConflictException('Email/username/phone already in use.');
    }
  }
}
