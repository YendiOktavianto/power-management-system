import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Cost } from './cost.entity';

@Entity('cost_history')
export class CostHistory {
  @PrimaryGeneratedColumn('uuid', { name: 'history_id' })
  history_id!: string;

  @Column({ name: 'cost_id', type: 'uuid' })
  cost_id!: string;

  @ManyToOne(() => Cost, (c) => c.histories, {
    onDelete: 'CASCADE',
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'cost_id', referencedColumnName: 'cost_id' })
  cost!: Cost;

  @Column({ name: 'cost_value', type: 'numeric', precision: 12, scale: 2 })
  cost_value!: string;

  @Column({ name: 'valid_from', type: 'date' })
  valid_from!: string;

  @Column({ name: 'valid_to', type: 'date', nullable: true })
  valid_to?: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;
}
