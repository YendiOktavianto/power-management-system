import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { GeneralInfo } from './general-info.entity';
import { Cost } from './cost.entity';
@Entity('monitoring_info')
export class MonitoringInfo {
  @PrimaryGeneratedColumn({ name: 'monitoring_info_id', type: 'int' })
  monitoring_info_id!: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time without time zone' })
  time: string;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  voltage: string;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  current: string;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  frequency: string;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  power: string;

  @Column({ type: 'numeric', precision: 4, scale: 2 })
  power_factor: string;

  @Column({ type: 'numeric', precision: 16, scale: 4 })
  total_energy_usage: string;

  @Column({ type: 'numeric', precision: 16, scale: 4 })
  total_energy_usage_today: string;

  @Column({ type: 'numeric', precision: 16, scale: 4 })
  total_energy_usage_mtd: string;

  @Column({ type: 'numeric', precision: 16, scale: 4 })
  total_energy_cost: string;

  @Column({ type: 'numeric', precision: 16, scale: 4 })
  total_energy_cost_today: string;

  @Column({ type: 'numeric', precision: 16, scale: 4 })
  total_energy_cost_mtd: string;

  @ManyToOne(() => GeneralInfo, (g) => g.monitorings, {
    onDelete: 'CASCADE',
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'device_id' })
  device!: GeneralInfo;

  @ManyToOne(() => Cost, (c) => c.monitoringInfos, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'cost_id' })
  cost?: Cost;
}
