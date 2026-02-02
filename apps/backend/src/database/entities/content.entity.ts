import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('contents')
export class ContentEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'content_id' })
  content_id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120 })
  key: string;

  @Column({ type: process.env.DB_TYPE === 'mysql' ? 'json' : 'jsonb' })
  data!: Record<string, any>;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updated_by?: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;

  @ManyToOne(() => User, (u) => u.contents_updated, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'userId' })
  updated_by_user: User | null;
}
