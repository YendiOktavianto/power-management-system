import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm';
import { ResetOtp } from './reset-otp.entity';
import { RefreshSession } from './refresh-sessions.entity';
import { OrganizationMember } from './organization-member.entity';
import { Device } from './device.entity';
import { DeviceRequest } from './device-request.entity';
import { ContentEntity } from './content.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('users')
@Unique(['email', 'username']) // ERD: email unique, not null
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ length: 60 })
  username: string;

  @Column()
  password_hash: string;

  @Column()
  phone_number: string;

  @Column()
  email: string;

  @Column({ name: 'role_global', type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ nullable: true })
  profil_img?: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  @OneToMany(() => ResetOtp, (otp) => otp.user)
  otps!: ResetOtp[];

  @OneToMany(() => RefreshSession, (s) => s.user)
  refresh_sessions!: RefreshSession[];

  @OneToMany(() => OrganizationMember, (m) => m.user)
  organization_members!: OrganizationMember[];

  @OneToMany(() => Device, (d) => d.provisioned_by)
  provisioned_devices!: Device[];

  @OneToMany(() => DeviceRequest, (r) => r.requester)
  device_requests!: DeviceRequest[];

  @OneToMany(() => DeviceRequest, (r) => r.approver)
  approved_device_requests!: DeviceRequest[];

  @OneToMany(() => DeviceRequest, (r) => r.rejecter)
  rejected_device_requests!: DeviceRequest[];

  @OneToMany(() => ContentEntity, (c: ContentEntity) => c.updated_by_user!)
  contents_updated!: ContentEntity[];
}
