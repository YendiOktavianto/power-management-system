import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

export enum OrganizationMemberRole {
  OWNER = 'OWNER',
  PRINCIPAL = 'PRINCIPAL',
  COMPANY = 'COMPANY',
  CUSTOMER = 'CUSTOMER',
}

export enum OrganizationMemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('organization_members')
export class OrganizationMember {
  @PrimaryGeneratedColumn('uuid', { name: 'org_member_id' })
  orgMemberId!: string;

  @Column({ name: 'org_id', type: 'uuid' })
  orgId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'role_in_org', type: 'enum', enum: OrganizationMemberRole })
  roleInOrg!: OrganizationMemberRole;

  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt!: Date;

  @Column({
    name: 'status',
    type: 'enum',
    enum: OrganizationMemberStatus,
    default: OrganizationMemberStatus.ACTIVE,
  })
  status!: OrganizationMemberStatus;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @ManyToOne(() => Organization, (org) => org.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id', referencedColumnName: 'orgId' })
  organization!: Organization;

  @ManyToOne(() => User, (u) => u.organizationMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user!: User;
}
