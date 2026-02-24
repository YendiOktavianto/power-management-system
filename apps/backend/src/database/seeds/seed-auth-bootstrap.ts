import * as argon2 from 'argon2';
import { DataSource, Repository } from 'typeorm';
import dataSource from '../ormconfig';
import { Organization, OrganizationType } from '../entities/organization.entity';
import {
  OrganizationMember,
  OrganizationMemberRole,
  OrganizationMemberStatus,
} from '../entities/organization-member.entity';
import { User, UserRole, UserStatus } from '../entities/user.entity';

type BootstrapAccount = {
  key: string;
  username: string;
  email: string;
  phoneNumber: string;
  roleGlobal: UserRole;
  ownerMember: boolean;
};

type SeedResult = {
  ownerOrgId: string;
  accounts: Array<{
    key: string;
    userId: string;
    email: string;
    username: string;
    roleGlobal: UserRole;
    ownerOrgMember: boolean;
  }>;
};

const OWNER_ORG_NAME = process.env.BOOTSTRAP_OWNER_ORG_NAME ?? 'PT Innotech Global Solusindo';
const DEFAULT_PASSWORD = process.env.BOOTSTRAP_AUTH_PASSWORD ?? 'PmsLocal#12345';

const ACCOUNTS: BootstrapAccount[] = [
  {
    key: 'admin_developer',
    username: 'admin.developer',
    email: 'admin.developer@pms.local',
    phoneNumber: '081100000001',
    roleGlobal: UserRole.ADMIN,
    ownerMember: false,
  },
  {
    key: 'tri_wardiyanto_owner',
    username: 'tri.wardiyanto',
    email: 'tri.wardiyanto@pms.local',
    phoneNumber: '081100000002',
    roleGlobal: UserRole.USER,
    ownerMember: true,
  },
  {
    key: 'owner_owner',
    username: 'owner.account',
    email: 'owner@pms.local',
    phoneNumber: '081100000003',
    roleGlobal: UserRole.USER,
    ownerMember: true,
  },
  {
    key: 'testing_account_owner',
    username: 'testing.owner',
    email: 'testing.owner@pms.local',
    phoneNumber: '081100000004',
    roleGlobal: UserRole.USER,
    ownerMember: true,
  },
];

async function ensureOwnerOrg(orgRepo: Repository<Organization>): Promise<Organization> {
  const existing = await orgRepo.findOne({
    where: {
      name: OWNER_ORG_NAME,
      type: OrganizationType.OWNER,
    },
  });

  if (existing) {
    if (!existing.isActive || existing.parentId !== null) {
      existing.isActive = true;
      existing.parentId = null;
      await orgRepo.save(existing);
    }
    return existing;
  }

  const created = orgRepo.create({
    name: OWNER_ORG_NAME,
    type: OrganizationType.OWNER,
    parentId: null,
    isActive: true,
  });
  return orgRepo.save(created);
}

async function ensureUser(
  userRepo: Repository<User>,
  account: BootstrapAccount,
  passwordHash: string,
): Promise<User> {
  const existing = await userRepo.findOne({
    where: [{ email: account.email }, { username: account.username }],
  });

  if (!existing) {
    const created = userRepo.create({
      username: account.username,
      email: account.email,
      phoneNumber: account.phoneNumber,
      passwordHash,
      role: account.roleGlobal,
      status: UserStatus.ACTIVE,
    });
    return userRepo.save(created);
  }

  let changed = false;
  if (existing.username !== account.username) {
    existing.username = account.username;
    changed = true;
  }
  if (existing.email !== account.email) {
    existing.email = account.email;
    changed = true;
  }
  if (existing.phoneNumber !== account.phoneNumber) {
    existing.phoneNumber = account.phoneNumber;
    changed = true;
  }
  if (existing.role !== account.roleGlobal) {
    existing.role = account.roleGlobal;
    changed = true;
  }
  if (existing.status !== UserStatus.ACTIVE) {
    existing.status = UserStatus.ACTIVE;
    changed = true;
  }

  if (changed) {
    return userRepo.save(existing);
  }
  return existing;
}

async function ensureOwnerMembership(
  memberRepo: Repository<OrganizationMember>,
  orgId: string,
  userId: string,
): Promise<void> {
  const existing = await memberRepo.findOne({
    where: { orgId, userId, roleInOrg: OrganizationMemberRole.OWNER },
  });

  if (!existing) {
    const created = memberRepo.create({
      orgId,
      userId,
      roleInOrg: OrganizationMemberRole.OWNER,
      status: OrganizationMemberStatus.ACTIVE,
      joinedAt: new Date(),
    });
    await memberRepo.save(created);
    return;
  }

  if (existing.status !== OrganizationMemberStatus.ACTIVE) {
    existing.status = OrganizationMemberStatus.ACTIVE;
    await memberRepo.save(existing);
  }
}

async function main(): Promise<void> {
  const ds: DataSource = await dataSource.initialize();
  try {
    const orgRepo = ds.getRepository(Organization);
    const userRepo = ds.getRepository(User);
    const memberRepo = ds.getRepository(OrganizationMember);

    const ownerOrg = await ensureOwnerOrg(orgRepo);
    const passwordHash = await argon2.hash(DEFAULT_PASSWORD);
    const results: SeedResult = {
      ownerOrgId: ownerOrg.orgId,
      accounts: [],
    };

    for (const account of ACCOUNTS) {
      const user = await ensureUser(userRepo, account, passwordHash);
      if (account.ownerMember) {
        await ensureOwnerMembership(memberRepo, ownerOrg.orgId, user.userId);
      }

      results.accounts.push({
        key: account.key,
        userId: user.userId,
        email: user.email,
        username: user.username,
        roleGlobal: user.role,
        ownerOrgMember: account.ownerMember,
      });
    }

    console.log('Bootstrap auth seed completed.');
    console.log('Owner organization:', OWNER_ORG_NAME, results.ownerOrgId);
    console.log('Default password for all seeded accounts:', DEFAULT_PASSWORD);
    console.log(
      JSON.stringify(
        {
          postmanEnv: {
            owner_org_id: results.ownerOrgId,
            admin_user_id: results.accounts.find((a) => a.key === 'admin_developer')?.userId ?? '',
            owner_user_id: results.accounts.find((a) => a.key === 'owner_owner')?.userId ?? '',
            tri_owner_user_id:
              results.accounts.find((a) => a.key === 'tri_wardiyanto_owner')?.userId ?? '',
            testing_owner_user_id:
              results.accounts.find((a) => a.key === 'testing_account_owner')?.userId ?? '',
          },
          accounts: results.accounts,
        },
        null,
        2,
      ),
    );
  } finally {
    await ds.destroy();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
