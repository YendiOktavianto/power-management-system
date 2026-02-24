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
  requestId!: string;

  @Column({ name: 'requester_user_id', type: 'uuid' })
  requesterUserId!: string;

  @Column({ name: 'requester_org_id', type: 'uuid' })
  requesterOrgId!: string;

  @Column({ name: 'target_org_id', type: 'uuid' })
  targetOrgId!: string;

  @Column({ name: 'address_id', type: 'uuid', nullable: true })
  addressId?: string | null;

  @Column({ name: 'address_name', type: 'varchar', nullable: true })
  addressName?: string | null;

  @Column({ name: 'detail_address', type: 'varchar', nullable: true })
  detailAddress?: string | null;

  @Column({ name: 'location_label', type: 'varchar', nullable: true })
  locationLabel?: string | null;

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
  approvedBy?: string | null;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt?: Date | null;

  @Column({ name: 'rejected_by', type: 'uuid', nullable: true })
  rejectedBy?: string | null;

  @Column({ name: 'rejected_at', type: 'timestamptz', nullable: true })
  rejectedAt?: Date | null;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string | null;

  @Column({ name: 'device_id', type: 'uuid', nullable: true })
  deviceId?: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @ManyToOne(() => User, (u) => u.deviceRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_user_id', referencedColumnName: 'userId' })
  requester!: User;

  @ManyToOne(() => Organization, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'requester_org_id', referencedColumnName: 'orgId' })
  requesterOrg!: Organization;

  @ManyToOne(() => Organization, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'target_org_id', referencedColumnName: 'orgId' })
  targetOrg!: Organization;

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
  @JoinColumn({ name: 'device_id', referencedColumnName: 'deviceId' })
  device?: Device | null;
}
