import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Address } from './address.entity';
import { Device } from './device.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid', { name: 'location_id' })
  locationId!: string;

  @Column({ name: 'address_id', type: 'uuid' })
  addressId!: string;

  @Column({ name: 'location_label', type: 'varchar' })
  locationLabel!: string;

  @Column({ name: 'detail_address', type: 'varchar', nullable: true })
  detailAddress?: string | null;

  @Column({ name: 'segment', type: 'varchar', nullable: true })
  segment?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @ManyToOne(() => Address, (addr) => addr.locations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'address_id', referencedColumnName: 'addressId' })
  address!: Address;

  @OneToMany(() => Device, (d) => d.location)
  devices!: Device[];
}
