import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('contents')
export class ContentEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'content_id' })
  contentId!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120 })
  key!: string;

  @Column({ type: process.env.DB_TYPE === 'mysql' ? 'json' : 'jsonb' })
  data!: Record<string, any>;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @ManyToOne(() => User, (u) => u.contentsUpdated, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'userId' })
  updatedByUser?: User | null;
}
