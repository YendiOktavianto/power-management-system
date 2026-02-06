import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { OrganizationMember } from './organization-member.entity';
import { Device } from './device.entity';
import { DeviceRequest } from './device-request.entity';
import { AccountInvite } from './account-invite.entity';
import { AuditLog } from './audit-log.entity';

export enum OrganizationType {
  OWNER = 'OWNER',
  PRINCIPAL = 'PRINCIPAL',
  COMPANY = 'COMPANY',
  CUSTOMER = 'CUSTOMER',
}

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid', { name: 'org_id' })
  orgId!: string;

  @Column({ name: 'name', type: 'varchar' })
  name!: string;

  @Column({ name: 'type', type: 'enum', enum: OrganizationType })
  type!: OrganizationType;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @ManyToOne(() => Organization, (org) => org.children, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id', referencedColumnName: 'orgId' })
  parent?: Organization | null;

  @OneToMany(() => Organization, (org) => org.parent)
  children!: Organization[];

  @OneToMany(() => OrganizationMember, (m) => m.organization)
  members!: OrganizationMember[];

  @OneToMany(() => Device, (d) => d.ownerOrg)
  devices!: Device[];

  @OneToMany(() => DeviceRequest, (r) => r.requester_org)
  deviceRequestsRequester!: DeviceRequest[];

  @OneToMany(() => DeviceRequest, (r) => r.target_org)
  deviceRequestsTarget!: DeviceRequest[];

  @OneToMany(() => AccountInvite, (i) => i.organization)
  accountInvites!: AccountInvite[];

  @OneToMany(() => AuditLog, (l) => l.actorOrg)
  auditLogs!: AuditLog[];
}
