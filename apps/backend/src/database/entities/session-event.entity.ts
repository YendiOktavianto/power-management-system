import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { RefreshSession } from './refresh-sessions.entity';
import { User } from './user.entity';

export enum SessionEventType {
  ISSUED = 'ISSUED',
  REFRESHED = 'REFRESHED',
  REVOKED = 'REVOKED',
  REPLACED = 'REPLACED',
}

@Entity('session_event')
export class SessionEvent {
  @PrimaryGeneratedColumn('uuid', { name: 'event_id' })
  eventId!: string;

  @Column({ name: 'refresh_session_id', type: 'uuid' })
  refreshSessionId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'event', type: 'enum', enum: SessionEventType })
  event!: SessionEventType;

  @Column({ name: 'ip', type: 'varchar', nullable: true })
  ip?: string | null;

  @Column({ name: 'user_agent', type: 'varchar', nullable: true })
  userAgent?: string | null;

  @Index()
  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @ManyToOne(() => RefreshSession, (s) => s.sessionEvents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'refresh_session_id', referencedColumnName: 'refreshSessionId' })
  refreshSession!: RefreshSession;

  @ManyToOne(() => User, (u) => u.sessionEvents, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user!: User;
}
