import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CostHistory } from './cost-history.entity';
import { TelemetryReading } from './telemetry-reading.entity';

@Entity('cost')
export class Cost {
  @PrimaryGeneratedColumn('uuid', { name: 'cost_id' })
  cost_id!: string;

  @Column({ name: 'tariff_group', type: 'varchar' })
  tariff_group!: string;

  @Column({ name: 'power_limit', type: 'varchar' })
  power_limit!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;

  @OneToMany(() => CostHistory, (h) => h.cost)
  histories!: CostHistory[];

  @OneToMany(() => TelemetryReading, (t) => t.cost)
  telemetry_readings!: TelemetryReading[];
}
