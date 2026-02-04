import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Cost } from './cost.entity';

@Entity('cost_history')
export class CostHistory {
  @PrimaryGeneratedColumn('uuid', { name: 'history_id' })
  historyId!: string;

  @Column({ name: 'cost_id', type: 'uuid' })
  costId!: string;

  @Column({ name: 'cost_value', type: 'numeric', precision: 12, scale: 2 })
  costValue!: string;

  @Column({ name: 'valid_from', type: 'date' })
  validFrom!: string;

  @Column({ name: 'valid_to', type: 'date', nullable: true })
  validTo?: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @ManyToOne(() => Cost, (c) => c.histories, {
    onDelete: 'CASCADE',
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'cost_id', referencedColumnName: 'costId' })
  cost!: Cost;
}
