import { Column, Entity, ManyToOne, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { Address } from './address.entity';
import { Device } from './device.entity';

export enum DeviceRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity({ name: 'device_requests' })
export class DeviceRequest {
  @PrimaryGeneratedColumn('uuid', { name: 'request_id' })
  request_id!: string;

  @Column({ name: 'requester_user_id', type: 'uuid' })
  requester_user_id!: string;

  @Column({ name: 'requester_org_id', type: 'uuid' })
  requester_org_id!: string;

  @Column({ name: 'target_org_id', type: 'uuid' })
  target_org_id!: string;

  @Column({ name: 'address_id', type: 'uuid', nullable: true })
  address_id?: string | null;

  @Column({ name: 'address_name', type: 'varchar', nullable: true })
  address_name?: string | null;

  @Column({ name: 'detail_address', type: 'varchar', nullable: true })
  detail_address?: string | null;

  @Column({ name: 'location_label', type: 'varchar', nullable: true })
  location_label?: string | null;

  @Column({ name: 'longitude', type: 'double precision' })
  longitude!: number;

  @Column({ name: 'latitude', type: 'double precision' })
  latitude!: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: DeviceRequestStatus,
    default: DeviceRequestStatus.PENDING,
  })
  status!: DeviceRequestStatus;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approved_by?: string | null;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approved_at?: Date | null;

  @Column({ name: 'rejected_by', type: 'uuid', nullable: true })
  rejected_by?: string | null;

  @Column({ name: 'rejected_at', type: 'timestamptz', nullable: true })
  rejected_at?: Date | null;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string | null;

  @Column({ name: 'device_id', type: 'uuid', nullable: true })
  device_id?: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  @ManyToOne(() => User, (u) => u.deviceRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_user_id', referencedColumnName: 'userId' })
  requester!: User;

  @ManyToOne(() => Organization, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'requester_org_id', referencedColumnName: 'org_id' })
  requester_org!: Organization;

  @ManyToOne(() => Organization, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'target_org_id', referencedColumnName: 'org_id' })
  target_org!: Organization;

  @ManyToOne(() => Address, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'address_id', referencedColumnName: 'addressId' })
  address?: Address | null;

  @ManyToOne(() => User, (u) => u.approvedDeviceRequests, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by', referencedColumnName: 'userId' })
  approver?: User | null;

  @ManyToOne(() => User, (u) => u.rejectedDeviceRequests, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'rejected_by', referencedColumnName: 'userId' })
  rejecter?: User | null;

  @OneToOne(() => Device, (d) => d.deviceRequest, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'device_id', referencedColumnName: 'device_id' })
  device?: Device | null;
}
