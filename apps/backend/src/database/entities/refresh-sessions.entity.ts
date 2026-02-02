import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_sessions')
export class RefreshSession {
  @PrimaryGeneratedColumn('uuid', { name: 'refresh_session_id' })
  refresh_session_id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar' })
  jti!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id!: string;

  @Column({ name: 'token_hash', type: 'varchar' })
  token_hash!: string;

  @Index()
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expires_at!: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revoked_at?: Date | null;

  @Column({ name: 'replaced_by_jti', type: 'varchar', nullable: true })
  replaced_by_jti?: string | null;

  @Column({ name: 'user_agent', type: 'varchar', nullable: true })
  user_agent?: string | null;

  @Column({ name: 'ip', type: 'varchar', nullable: true })
  ip?: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  @ManyToOne(() => User, (u) => u.refresh_sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user!: User;
}
