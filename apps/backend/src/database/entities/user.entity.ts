import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm';
import { ResetOtp } from './reset-otp.entity';
import { RefreshSession } from './refresh-sessions.entity';
import { OrganizationMember } from './organization-member.entity';
import { Device } from './device.entity';
import { DeviceRequest } from './device-request.entity';
import { ContentEntity } from './content.entity';
import { AccountInvite } from './account-invite.entity';
import { AuditLog } from './audit-log.entity';
import { LoginAttempt } from './login-attempt.entity';
import { SessionEvent } from './session-event.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('users')
@Unique(['email', 'username'])
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId!: string;

  @Column({ name: 'username', length: 60 })
  username!: string;

  @Column({ name: 'email' })
  email!: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber?: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'role_global', type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ name: 'profil_img', nullable: true })
  profileImg?: string;

  @Column({ name: 'status', type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => ResetOtp, (otp) => otp.user)
  otps!: ResetOtp[];

  @OneToMany(() => RefreshSession, (s) => s.user)
  refreshSessions!: RefreshSession[];

  @OneToMany(() => OrganizationMember, (m) => m.user)
  organizationMemberships!: OrganizationMember[];

  @OneToMany(() => Device, (d) => d.provisionedBy)
  provisionedDevices!: Device[];

  @OneToMany(() => DeviceRequest, (r) => r.requester)
  deviceRequests!: DeviceRequest[];

  @OneToMany(() => DeviceRequest, (r) => r.approver)
  approvedDeviceRequests!: DeviceRequest[];

  @OneToMany(() => DeviceRequest, (r) => r.rejecter)
  rejectedDeviceRequests!: DeviceRequest[];

  @OneToMany(() => ContentEntity, (c: ContentEntity) => c.updatedByUser!)
  contentsUpdated!: ContentEntity[];

  @OneToMany(() => AccountInvite, (i) => i.user)
  accountInvites!: AccountInvite[];

  @OneToMany(() => AccountInvite, (i) => i.createdByUser)
  createdAccountInvites!: AccountInvite[];

  @OneToMany(() => AuditLog, (l) => l.actorUser)
  auditLogs!: AuditLog[];

  @OneToMany(() => LoginAttempt, (a) => a.user)
  loginAttempts!: LoginAttempt[];

  @OneToMany(() => SessionEvent, (e) => e.user)
  sessionEvents!: SessionEvent[];
}
