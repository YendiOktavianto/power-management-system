import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { OrganizationMember } from './organization-member.entity';
import { Device } from './device.entity';
import { DeviceRequest } from './device-request.entity';

export enum OrganizationType {
  OWNER = 'OWNER',
  PRINCIPAL = 'PRINCIPAL',
  COMPANY = 'COMPANY',
  CUSTOMER = 'CUSTOMER',
}

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid', { name: 'org_id' })
  org_id!: string;

  @Column({ name: 'name', type: 'varchar' })
  name!: string;

  @Column({ name: 'type', type: 'enum', enum: OrganizationType })
  type!: OrganizationType;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parent_id?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;

  @ManyToOne(() => Organization, (org) => org.children, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id', referencedColumnName: 'org_id' })
  parent?: Organization | null;

  @OneToMany(() => Organization, (org) => org.parent)
  children!: Organization[];

  @OneToMany(() => OrganizationMember, (m) => m.organization)
  members!: OrganizationMember[];

  @OneToMany(() => Device, (d) => d.owner_org)
  devices!: Device[];

  @OneToMany(() => DeviceRequest, (r) => r.requester_org)
  device_requests_requester!: DeviceRequest[];

  @OneToMany(() => DeviceRequest, (r) => r.target_org)
  device_requests_target!: DeviceRequest[];
}
