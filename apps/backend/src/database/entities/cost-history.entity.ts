import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Cost } from './cost.entity';

@Entity('cost_history')
export class CostHistory {
  @PrimaryGeneratedColumn({ name: 'history_id', type: 'int' })
  history_id!: number;
  @ManyToOne(() => Cost, (c) => c.histories, {
    onDelete: 'CASCADE',
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'cost_id' })
  cost!: Cost;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  cost_value: string;

  @Column({ type: 'date' })
  valid_from: string;

  @Column({ type: 'date', nullable: true })
  valid_to: string | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
