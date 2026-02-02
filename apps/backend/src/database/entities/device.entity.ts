import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Location } from './location.entity';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { TelemetryReading } from './telemetry-reading.entity';
import { DeviceRequest } from './device-request.entity';

export enum DevicePhase {
  ONE_PHASE = '1 PHASE',
  THREE_PHASE = '3 PHASE',
}

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid', { name: 'device_id' })
  device_id!: string;

  @Column({ name: 'serial_number', type: 'varchar', unique: true })
  serial_number!: string;

  @Column({ name: 'device_name', type: 'varchar', nullable: true })
  device_name?: string | null;

  @Column({ name: 'phase', type: 'enum', enum: DevicePhase })
  phase!: DevicePhase;

  @Column({ name: 'wattage', type: 'varchar', nullable: true })
  wattage?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ name: 'location_id', type: 'uuid' })
  location_id!: string;

  @Column({ name: 'owner_org_id', type: 'uuid' })
  owner_org_id!: string;

  @Column({ name: 'provisioned_by_user_id', type: 'uuid', nullable: true })
  provisioned_by_user_id?: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;

  @ManyToOne(() => Location, (loc) => loc.devices, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'location_id', referencedColumnName: 'location_id' })
  location!: Location;

  @ManyToOne(() => Organization, (org) => org.devices, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'owner_org_id', referencedColumnName: 'org_id' })
  owner_org!: Organization;

  @ManyToOne(() => User, (u) => u.provisioned_devices, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'provisioned_by_user_id', referencedColumnName: 'userId' })
  provisioned_by?: User | null;

  @OneToMany(() => TelemetryReading, (t) => t.device)
  telemetry!: TelemetryReading[];

  @OneToOne(() => DeviceRequest, (r) => r.device)
  device_request?: DeviceRequest | null;
}
