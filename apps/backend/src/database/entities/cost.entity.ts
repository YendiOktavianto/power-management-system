import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CostHistory } from './cost-history.entity';
import { TelemetryReading } from './telemetry-reading.entity';

@Entity('cost')
export class Cost {
  @PrimaryGeneratedColumn('uuid', { name: 'cost_id' })
  costId!: string;

  @Column({ name: 'tariff_group', type: 'varchar' })
  tariffGroup!: string;

  @Column({ name: 'power_limit', type: 'varchar' })
  powerLimit!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @OneToMany(() => CostHistory, (h) => h.cost)
  histories!: CostHistory[];

  @OneToMany(() => TelemetryReading, (t) => t.cost)
  telemetryReadings!: TelemetryReading[];
}
