import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Location } from './location.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid', { name: 'address_id' })
  address_id!: string;

  @Column({ name: 'address_name', type: 'varchar' })
  address_name!: string;

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
  postal_code?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;

  @OneToMany(() => Location, (loc) => loc.address)
  locations!: Location[];
}
