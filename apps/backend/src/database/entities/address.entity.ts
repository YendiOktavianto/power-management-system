import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  Unique,
  Index,
  OneToMany,
} from 'typeorm';
import { Location } from './location.entity';

@Entity('address')
@Index(['longitude', 'latitude'], { unique: true })
export class Address {
  @PrimaryGeneratedColumn({ name: 'address_id', type: 'int' })
  address_id!: number;

  @Column({ name: 'address_name', type: 'varchar', length: 200, nullable: true })
  address_name!: string | null;

  @Column({ name: 'detail_address_name', type: 'varchar', length: 200, nullable: true })
  detail_address_name: string | null;

  @Column({ name: 'longitude', type: 'double precision' })
  longitude!: number;

  @Column({ name: 'latitude', type: 'double precision' })
  latitude!: number;

  @OneToMany(() => Location, (loc) => loc.address)
  location: Location;
}
