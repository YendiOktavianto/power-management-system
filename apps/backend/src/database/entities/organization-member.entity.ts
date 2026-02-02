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
  org_member_id!: string;

  @Column({ name: 'org_id', type: 'uuid' })
  org_id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id!: string;

  @Column({ name: 'role_in_org', type: 'enum', enum: OrganizationMemberRole })
  role_in_org!: OrganizationMemberRole;

  @Column({ name: 'status', type: 'enum', enum: OrganizationMemberStatus, default: OrganizationMemberStatus.ACTIVE })
  status!: OrganizationMemberStatus;

  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  joined_at!: Date;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;

  @ManyToOne(() => Organization, (org) => org.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id', referencedColumnName: 'org_id' })
  organization!: Organization;

  @ManyToOne(() => User, (u) => u.organization_members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user!: User;
}
