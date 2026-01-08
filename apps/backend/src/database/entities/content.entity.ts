import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('contents')
export class ContentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120 })
  key: string;

  // PostgreSQL: jsonb ; MySQL: pakai 'json'
  @Column({ type: process.env.DB_TYPE === 'mysql' ? 'json' : 'jsonb', default: {} })
  data: Record<string, any>;

  @Column({ type: 'varchar', length: 120, nullable: true })
  updatedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
