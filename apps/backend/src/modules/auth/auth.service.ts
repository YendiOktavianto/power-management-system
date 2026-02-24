import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, type FindOptionsWhere } from 'typeorm';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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
import { RefreshSession } from '../../database/entities/refresh-sessions.entity';
import { SessionEvent, SessionEventType } from '../../database/entities/session-event.entity';
import { LoginAttempt } from '../../database/entities/login-attempt.entity';

import { CreatePrincipalDto } from './dto/create-principal.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';

type ActorContext = {
  userId: string;
  orgId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

type RequestContext = {
  ip?: string | null;
  userAgent?: string | null;
};

type AccessTokenPayload = {
  sub: string;
  role: UserRole;
  type: 'access';
};

type RefreshTokenPayload = {
  sub: string;
  jti: string;
  type: 'refresh';
};

type ProvisioningResult = {
  userId: string;
  orgId: string;
  roleInOrg: OrganizationMemberRole;
  status: UserStatus;
  inviteSentTo: string;
  inviteToken?: string;
};

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
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
    @InjectRepository(RefreshSession)
    private readonly refreshSessions: Repository<RefreshSession>,
    @InjectRepository(SessionEvent)
    private readonly sessionEvents: Repository<SessionEvent>,
    @InjectRepository(LoginAttempt)
    private readonly loginAttempts: Repository<LoginAttempt>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

  async setPassword(
    dto: SetPasswordDto,
    context: RequestContext,
  ): Promise<{ userId: string; status: UserStatus }> {
    const tokenHash = this.hashToken(dto.inviteToken);
    const invite = await this.accountInvites.findOne({
      where: { tokenHash, purpose: AccountInvitePurpose.SET_PASSWORD },
    });

    if (!invite) {
      throw new UnprocessableEntityException('Invite token invalid.');
    }
    if (invite.usedAt) {
      throw new ConflictException('Invite token already used.');
    }
    if (invite.expiresAt.getTime() < Date.now()) {
      throw new UnprocessableEntityException('Invite token expired.');
    }

    const passwordHash = await argon2.hash(dto.newPassword);

    return this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const memberRepo = manager.getRepository(OrganizationMember);
      const inviteRepo = manager.getRepository(AccountInvite);
      const auditRepo = manager.getRepository(AuditLog);

      const user = await userRepo.findOne({ where: { userId: invite.userId } });
      if (!user) {
        throw new BadRequestException('Invite user not found.');
      }

      user.passwordHash = passwordHash;
      user.status = UserStatus.ACTIVE;
      await userRepo.save(user);

      if (invite.orgId) {
        await memberRepo.update(
          { userId: invite.userId, orgId: invite.orgId },
          { status: OrganizationMemberStatus.ACTIVE },
        );
      } else {
        await memberRepo.update(
          { userId: invite.userId },
          { status: OrganizationMemberStatus.ACTIVE },
        );
      }

      invite.usedAt = new Date();
      invite.attempts += 1;
      await inviteRepo.save(invite);

      const auditInviteUsed = auditRepo.create({
        actorUserId: invite.userId,
        actorOrgId: invite.orgId ?? null,
        action: AuditAction.AUTH_ACCOUNT_INVITE_USED,
        targetType: AuditTargetType.ACCOUNT_INVITE,
        targetId: invite.inviteId,
        status: AuditLogStatus.SUCCESS,
        ip: context.ip ?? null,
        userAgent: context.userAgent ?? null,
      });
      await auditRepo.save(auditInviteUsed);

      const auditActivated = auditRepo.create({
        actorUserId: invite.userId,
        actorOrgId: invite.orgId ?? null,
        action: AuditAction.AUTH_ACCOUNT_ACTIVATED,
        targetType: AuditTargetType.USER,
        targetId: invite.userId,
        status: AuditLogStatus.SUCCESS,
        ip: context.ip ?? null,
        userAgent: context.userAgent ?? null,
        metadata: {
          inviteId: invite.inviteId,
          purpose: invite.purpose,
        },
      });
      await auditRepo.save(auditActivated);

      return {
        userId: user.userId,
        status: user.status,
      };
    });
  }

  async login(
    dto: LoginDto,
    context: RequestContext,
  ): Promise<{
    userId: string;
    status: UserStatus;
    roleGlobal: UserRole;
    tokens: SessionTokens;
  }> {
    const identifier = dto.identifier.trim();
    const user = await this.users.findOne({
      where: [{ email: identifier }, { username: identifier }, { phoneNumber: identifier }],
    });

    if (!user) {
      await this.recordLoginAttempt(identifier, false, null, context);
      throw new UnauthorizedException('Invalid credentials.');
    }

    const verified = await argon2.verify(user.passwordHash, dto.password);
    if (!verified) {
      await this.recordLoginAttempt(identifier, false, user, context);
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      await this.recordLoginAttempt(identifier, false, user, context);
      throw new ForbiddenException('Account is inactive.');
    }

    const tokens = await this.issueSessionTokens(user, context);
    await this.recordLoginAttempt(identifier, true, user, context);

    return {
      userId: user.userId,
      status: user.status,
      roleGlobal: user.role,
      tokens,
    };
  }

  async refresh(
    dto: RefreshTokenDto,
    context: RequestContext,
  ): Promise<{ userId: string; tokens: SessionTokens }> {
    const refreshPayload = await this.verifyRefreshToken(dto.refreshToken);
    const user = await this.users.findOne({ where: { userId: refreshPayload.sub } });
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const currentSession = await this.refreshSessions.findOne({
      where: { userId: user.userId, jti: refreshPayload.jti },
    });
    if (!currentSession) {
      throw new UnauthorizedException('Invalid refresh token.');
    }
    this.assertSessionUsable(currentSession);
    this.assertRefreshTokenMatch(dto.refreshToken, currentSession.tokenHash);

    const nextJti = crypto.randomUUID();
    const nextRefreshToken = await this.signRefreshToken(user.userId, nextJti);
    const nextTokenHash = this.hashToken(nextRefreshToken);
    const refreshTtlMs = this.parseDurationToMs(this.getRefreshTokenExpiresIn());
    const nextExpiresAt = new Date(Date.now() + refreshTtlMs);

    await this.dataSource.transaction(async (manager) => {
      const refreshRepo = manager.getRepository(RefreshSession);
      const eventRepo = manager.getRepository(SessionEvent);
      const auditRepo = manager.getRepository(AuditLog);

      const session = await refreshRepo.findOne({
        where: { refreshSessionId: currentSession.refreshSessionId },
      });
      if (!session) {
        throw new UnauthorizedException('Invalid refresh token.');
      }
      this.assertSessionUsable(session);
      this.assertRefreshTokenMatch(dto.refreshToken, session.tokenHash);

      session.revokedAt = new Date();
      session.replacedByJti = nextJti;
      session.updatedAt = new Date();
      await refreshRepo.save(session);

      const replacedEvent = eventRepo.create({
        refreshSessionId: session.refreshSessionId,
        userId: user.userId,
        event: SessionEventType.REPLACED,
        ip: context.ip ?? null,
        userAgent: context.userAgent ?? null,
      });
      await eventRepo.save(replacedEvent);

      const nextSession = refreshRepo.create({
        userId: user.userId,
        jti: nextJti,
        tokenHash: nextTokenHash,
        expiresAt: nextExpiresAt,
        userAgent: context.userAgent ?? null,
        ip: context.ip ?? null,
      });
      await refreshRepo.save(nextSession);

      const issuedEvent = eventRepo.create({
        refreshSessionId: nextSession.refreshSessionId,
        userId: user.userId,
        event: SessionEventType.ISSUED,
        ip: context.ip ?? null,
        userAgent: context.userAgent ?? null,
      });
      await eventRepo.save(issuedEvent);

      const audit = auditRepo.create({
        actorUserId: user.userId,
        actorOrgId: null,
        action: AuditAction.AUTH_REFRESH_TOKEN,
        targetType: AuditTargetType.REFRESH_SESSION,
        targetId: nextSession.refreshSessionId,
        status: AuditLogStatus.SUCCESS,
        ip: context.ip ?? null,
        userAgent: context.userAgent ?? null,
        metadata: {
          replacedJti: session.jti,
          nextJti,
        },
      });
      await auditRepo.save(audit);
    });

    const accessToken = await this.signAccessToken(user.userId, user.role);

    return {
      userId: user.userId,
      tokens: {
        accessToken,
        refreshToken: nextRefreshToken,
        accessTokenExpiresIn: this.getAccessTokenExpiresIn(),
        refreshTokenExpiresIn: this.getRefreshTokenExpiresIn(),
      },
    };
  }

  async logout(dto: LogoutDto, context: RequestContext): Promise<{ success: true }> {
    const refreshPayload = await this.verifyRefreshToken(dto.refreshToken);
    const session = await this.refreshSessions.findOne({
      where: { userId: refreshPayload.sub, jti: refreshPayload.jti },
    });
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token.');
    }
    this.assertRefreshTokenMatch(dto.refreshToken, session.tokenHash);

    if (session.revokedAt) {
      return { success: true };
    }

    await this.dataSource.transaction(async (manager) => {
      const refreshRepo = manager.getRepository(RefreshSession);
      const eventRepo = manager.getRepository(SessionEvent);
      const auditRepo = manager.getRepository(AuditLog);

      const current = await refreshRepo.findOne({
        where: { refreshSessionId: session.refreshSessionId },
      });
      if (!current) {
        throw new UnauthorizedException('Invalid refresh token.');
      }
      if (current.revokedAt) {
        return;
      }

      current.revokedAt = new Date();
      current.updatedAt = new Date();
      await refreshRepo.save(current);

      const event = eventRepo.create({
        refreshSessionId: current.refreshSessionId,
        userId: current.userId,
        event: SessionEventType.REVOKED,
        ip: context.ip ?? null,
        userAgent: context.userAgent ?? null,
      });
      await eventRepo.save(event);

      const audit = auditRepo.create({
        actorUserId: current.userId,
        actorOrgId: null,
        action: AuditAction.AUTH_LOGOUT,
        targetType: AuditTargetType.REFRESH_SESSION,
        targetId: current.refreshSessionId,
        status: AuditLogStatus.SUCCESS,
        ip: context.ip ?? null,
        userAgent: context.userAgent ?? null,
      });
      await auditRepo.save(audit);
    });

    return { success: true };
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

  private async issueSessionTokens(user: User, context: RequestContext): Promise<SessionTokens> {
    const jti = crypto.randomUUID();
    const refreshToken = await this.signRefreshToken(user.userId, jti);
    const tokenHash = this.hashToken(refreshToken);
    const refreshTtlMs = this.parseDurationToMs(this.getRefreshTokenExpiresIn());
    const expiresAt = new Date(Date.now() + refreshTtlMs);
    const accessToken = await this.signAccessToken(user.userId, user.role);

    await this.dataSource.transaction(async (manager) => {
      const refreshRepo = manager.getRepository(RefreshSession);
      const eventRepo = manager.getRepository(SessionEvent);
      const auditRepo = manager.getRepository(AuditLog);

      const session = refreshRepo.create({
        userId: user.userId,
        jti,
        tokenHash,
        expiresAt,
        userAgent: context.userAgent ?? null,
        ip: context.ip ?? null,
      });
      await refreshRepo.save(session);

      const event = eventRepo.create({
        refreshSessionId: session.refreshSessionId,
        userId: user.userId,
        event: SessionEventType.ISSUED,
        ip: context.ip ?? null,
        userAgent: context.userAgent ?? null,
      });
      await eventRepo.save(event);

      const audit = auditRepo.create({
        actorUserId: user.userId,
        actorOrgId: null,
        action: AuditAction.AUTH_LOGIN_SUCCESS,
        targetType: AuditTargetType.REFRESH_SESSION,
        targetId: session.refreshSessionId,
        status: AuditLogStatus.SUCCESS,
        ip: context.ip ?? null,
        userAgent: context.userAgent ?? null,
      });
      await auditRepo.save(audit);
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: this.getAccessTokenExpiresIn(),
      refreshTokenExpiresIn: this.getRefreshTokenExpiresIn(),
    };
  }

  private async signAccessToken(userId: string, role: UserRole): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: userId,
      role,
      type: 'access',
    };
    return this.jwtService.signAsync(payload, {
      secret: this.getAccessTokenSecret(),
      expiresIn: this.getAccessTokenExpiresIn(),
    });
  }

  private async signRefreshToken(userId: string, jti: string): Promise<string> {
    const payload: RefreshTokenPayload = {
      sub: userId,
      jti,
      type: 'refresh',
    };
    return this.jwtService.signAsync(payload, {
      secret: this.getRefreshTokenSecret(),
      expiresIn: this.getRefreshTokenExpiresIn(),
    });
  }

  private async verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.getRefreshTokenSecret(),
      });
      if (payload.type !== 'refresh' || !payload.sub || !payload.jti) {
        throw new UnauthorizedException('Invalid refresh token.');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  private async recordLoginAttempt(
    identifier: string,
    success: boolean,
    user: User | null,
    context: RequestContext,
  ): Promise<void> {
    const attempt = this.loginAttempts.create({
      userId: user?.userId ?? null,
      identifier,
      success,
      ip: context.ip ?? null,
      userAgent: context.userAgent ?? null,
    });
    await this.loginAttempts.save(attempt);

    if (!success && user) {
      const audit = this.auditLogs.create({
        actorUserId: user.userId,
        actorOrgId: null,
        action: AuditAction.AUTH_LOGIN_FAILED,
        targetType: AuditTargetType.USER,
        targetId: user.userId,
        status: AuditLogStatus.FAILED,
        ip: context.ip ?? null,
        userAgent: context.userAgent ?? null,
      });
      await this.auditLogs.save(audit);
    }
  }

  private assertSessionUsable(session: RefreshSession): void {
    if (session.revokedAt) {
      throw new UnauthorizedException('Invalid refresh token.');
    }
    if (session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired.');
    }
    const idleTimeoutMs = this.getSessionIdleTimeoutMs();
    const lastActivityAt = session.updatedAt ?? session.createdAt;
    if (Date.now() - lastActivityAt.getTime() > idleTimeoutMs) {
      throw new UnauthorizedException('Session idle timeout.');
    }
  }

  private assertRefreshTokenMatch(token: string, tokenHash: string): void {
    const incomingHash = this.hashToken(token);
    if (incomingHash !== tokenHash) {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  private hashToken(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  private getAccessTokenSecret(): string {
    return this.getRequiredEnv('JWT_ACCESS_SECRET');
  }

  private getRefreshTokenSecret(): string {
    return this.getRequiredEnv('JWT_REFRESH_SECRET');
  }

  private getAccessTokenExpiresIn(): string {
    return this.configService.get<string>('JWT_ACCESS_EXPIRES') ?? '15m';
  }

  private getRefreshTokenExpiresIn(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES') ?? '7d';
  }

  private getSessionIdleTimeoutMs(): number {
    const configured = this.configService.get<string>('JWT_IDLE_TIMEOUT') ?? '30m';
    return this.parseDurationToMs(configured);
  }

  private getRequiredEnv(name: string): string {
    const value = this.configService.get<string>(name);
    if (!value) {
      throw new InternalServerErrorException(`Missing environment variable ${name}.`);
    }
    return value;
  }

  private parseDurationToMs(value: string): number {
    const raw = value.trim();
    const match = /^(\d+)\s*([smhd])$/i.exec(raw);
    if (!match) {
      throw new InternalServerErrorException(`Invalid duration value: ${value}`);
    }
    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      default:
        throw new InternalServerErrorException(`Invalid duration unit: ${value}`);
    }
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
