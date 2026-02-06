import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export enum AccountInvitePurpose {
  SET_PASSWORD = 'SET_PASSWORD',
  ACTIVE = 'ACTIVE',
}

export enum AccountInviteChannel {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
}

@Entity('account_invites')
export class AccountInvite {
  @PrimaryGeneratedColumn('uuid', { name: 'invite_id' })
  inviteId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId!: string;

  @Column({ name: 'org_id', type: 'uuid', nullable: true })
  orgId?: string | null;

  @Column({ name: 'purpose', type: 'enum', enum: AccountInvitePurpose })
  purpose!: AccountInvitePurpose;

  @Index({ unique: true })
  @Column({ name: 'token_hash', type: 'varchar' })
  tokenHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  expiresAt!: Date;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt?: Date | null;

  @Column({ name: 'attempts', type: 'int', default: 0 })
  attempts!: number;

  @Column({ name: 'channel', type: 'enum', enum: AccountInviteChannel })
  channel!: AccountInviteChannel;

  @Column({ name: 'sent_to', type: 'varchar' })
  sentTo!: string;

  @Column({ name: 'ip', type: 'varchar', nullable: true })
  ip?: string | null;

  @Column({ name: 'user_agent', type: 'varchar', nullable: true })
  userAgent?: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @ManyToOne(() => User, (u) => u.accountInvites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user!: User;

  @ManyToOne(() => User, (u) => u.createdAccountInvites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by_user_id', referencedColumnName: 'userId' })
  createdByUser!: User;

  @ManyToOne(() => Organization, (o) => o.accountInvites, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'org_id', referencedColumnName: 'orgId' })
  organization?: Organization | null;
}
