import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from './device.entity';
import { Cost } from './cost.entity';

@Entity('telemetry_readings')
export class TelemetryReading {
  @PrimaryGeneratedColumn('uuid', { name: 'telemetry_id' })
  telemetryId!: string;

  @Column({ name: 'device_id', type: 'uuid' })
  deviceId!: string;

  @Column({ name: 'recorded_at', type: 'timestamptz' })
  recordedAt!: Date;

  @Column({ name: 'voltage', type: 'numeric' })
  voltage!: string;

  @Column({ name: 'current', type: 'numeric' })
  current!: string;

  @Column({ name: 'frequency', type: 'numeric' })
  frequency!: string;

  @Column({ name: 'power', type: 'numeric' })
  power!: string;

  @Column({ name: 'power_factor', type: 'numeric' })
  powerFactor!: string;

  @Column({ name: 'total_energy_usage', type: 'numeric', nullable: true })
  totalEnergyUsage?: string | null;

  @Column({ name: 'total_energy_usage_today', type: 'numeric', nullable: true })
  totalEnergyUsageToday?: string | null;

  @Column({ name: 'total_energy_usage_mtd', type: 'numeric', nullable: true })
  totalEnergyUsageMtd?: string | null;

  @Column({ name: 'total_energy_cost', type: 'numeric', nullable: true })
  totalEnergyCost?: string | null;

  @Column({ name: 'total_energy_cost_today', type: 'numeric', nullable: true })
  totalEnergyCostToday?: string | null;

  @Column({ name: 'total_energy_cost_mtd', type: 'numeric', nullable: true })
  totalEnergyCostMtd?: string | null;

  @Column({ name: 'cost_id', type: 'uuid', nullable: true })
  costId?: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @ManyToOne(() => Device, (d) => d.telemetry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id', referencedColumnName: 'deviceId' })
  device!: Device;

  @ManyToOne((): typeof Cost => Cost, (c): TelemetryReading[] => c.telemetryReadings, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'cost_id', referencedColumnName: 'costId' })
  cost?: Cost | null;
}
