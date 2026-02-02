import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from './device.entity';
import { Cost } from './cost.entity';

@Entity('telemetry_readings')
export class TelemetryReading {
  @PrimaryGeneratedColumn('uuid', { name: 'telemetry_id' })
  telemetry_id!: string;

  @Column({ name: 'device_id', type: 'uuid' })
  device_id!: string;

  @Column({ name: 'recorded_at', type: 'timestamptz' })
  recorded_at!: Date;

  @Column({ name: 'cost_id', type: 'uuid', nullable: true })
  cost_id?: string | null;

  @Column({ name: 'voltage', type: 'numeric' })
  voltage!: string;

  @Column({ name: 'current', type: 'numeric' })
  current!: string;

  @Column({ name: 'frequency', type: 'numeric' })
  frequency!: string;

  @Column({ name: 'power', type: 'numeric' })
  power!: string;

  @Column({ name: 'power_factor', type: 'numeric' })
  power_factor!: string;

  @Column({ name: 'total_energy_usage', type: 'numeric', nullable: true })
  total_energy_usage?: string | null;

  @Column({ name: 'total_energy_usage_today', type: 'numeric', nullable: true })
  total_energy_usage_today?: string | null;

  @Column({ name: 'total_energy_usage_mtd', type: 'numeric', nullable: true })
  total_energy_usage_mtd?: string | null;

  @Column({ name: 'total_energy_cost', type: 'numeric', nullable: true })
  total_energy_cost?: string | null;

  @Column({ name: 'total_energy_cost_today', type: 'numeric', nullable: true })
  total_energy_cost_today?: string | null;

  @Column({ name: 'total_energy_cost_mtd', type: 'numeric', nullable: true })
  total_energy_cost_mtd?: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @ManyToOne(() => Device, (d) => d.telemetry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id', referencedColumnName: 'device_id' })
  device!: Device;

  @ManyToOne(() => Cost, (c) => c.telemetry_readings, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cost_id', referencedColumnName: 'cost_id' })
  cost?: Cost | null;
}
