import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type DeviceRequestStatus = 'pending' | 'approved' | 'rejected';

@Entity({ name: 'device_requests' })
export class DeviceRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'varchar', length: 120 })
  username!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  segmen!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  detail_address!: string | null;

  // gunakan "double precision" untuk Postgres
  @Column({ type: 'double precision' })
  lat!: number;

  @Column({ type: 'double precision' })
  lng!: number;

  @Index()
  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status!: DeviceRequestStatus;

  // simpan epoch milliseconds (bigint)
  @Index()
  @Column({ type: 'bigint' })
  time!: string; // pakai string agar aman di JS (Postgres driver kembalikan string utk bigint)

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
