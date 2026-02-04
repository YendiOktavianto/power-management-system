import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Location } from './location.entity';
import { DeviceRequest } from './device-request.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid', { name: 'address_id' })
  addressId!: string;

  @Column({ name: 'address_name', type: 'varchar' })
  addressName!: string;

  @Column({ name: 'longitude', type: 'double precision' })
  longitude!: number;

  @Column({ name: 'latitude', type: 'double precision' })
  latitude!: number;

  @Column({ name: 'city', type: 'varchar', nullable: true })
  city?: string | null;

  @Column({ name: 'district', type: 'varchar', nullable: true })
  district?: string | null;

  @Column({ name: 'subdistrict', type: 'varchar', nullable: true })
  subdistrict?: string | null;

  @Column({ name: 'postal_code', type: 'varchar', nullable: true })
  postalCode?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @OneToMany(() => Location, (loc) => loc.address)
  locations!: Location[];

  @OneToMany(() => DeviceRequest, (dr) => dr.address)
  deviceRequests!: DeviceRequest[];
}
