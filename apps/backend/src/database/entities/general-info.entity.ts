import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Index,
  OneToMany,
} from 'typeorm';
import { Location } from './location.entity';
import { MonitoringInfo } from './monitoring-info.entity';
import { User } from './user.entity';

export enum PhaseType {
  ONE_PHASE = '1 PHASE',
  THREE_PHASE = '3 PHASE',
}

@Entity('general_info')
export class GeneralInfo {
  @PrimaryGeneratedColumn({ name: 'device_id', type: 'int' })
  device_id!: number;

  @Index({ unique: true })
  @Column({ name: 'serial_number', type: 'varchar', length: 32 })
  serial_number!: string;

  @Column({ name: 'device_name', type: 'varchar', nullable: true })
  device_name!: string | null;

  @Column({ name: 'isActive', type: 'boolean', default: false })
  isActive!: boolean;

  @Column({
    name: 'phase',
    type: 'varchar',
    length: 16,
    default: PhaseType.ONE_PHASE,
  })
  phase: PhaseType;

  @Column({ name: 'wattage', type: 'varchar', length: 32, nullable: true })
  wattage!: string | null;

  @OneToMany(() => MonitoringInfo, (m) => m.device)
  monitorings!: MonitoringInfo[];

  @ManyToOne(() => User, (u) => u.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user!: User;

  @OneToOne(() => Location, (loc) => loc.device)
  location!: Location;
}
