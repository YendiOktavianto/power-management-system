import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Address } from './address.entity';
import { Device } from './device.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid', { name: 'location_id' })
  location_id!: string;

  @Column({ name: 'address_id', type: 'uuid' })
  address_id!: string;

  @Column({ name: 'location_label', type: 'varchar' })
  location_label!: string;

  @Column({ name: 'detail_address', type: 'varchar', nullable: true })
  detail_address?: string | null;

  @Column({ name: 'segment', type: 'varchar', nullable: true })
  segment?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;

  @ManyToOne(() => Address, (addr) => addr.locations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'address_id', referencedColumnName: 'address_id' })
  address!: Address;

  @OneToMany(() => Device, (d) => d.location)
  devices!: Device[];
}
