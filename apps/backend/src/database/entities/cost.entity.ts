import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { CostHistory } from './cost-history.entity';
import { MonitoringInfo } from './monitoring-info.entity';

export enum GolTarif {
  R1_TR = 'R-1/TR',
  R2_TR = 'R-2/TR',
  R3_TR = 'R-3/TR',
}

@Entity('cost')
export class Cost {
  @PrimaryGeneratedColumn({ name: 'cost_id', type: 'int' })
  cost_id!: number;

  // Contoh nilai: "R-1/TR", "R-2/TR", dst.
  @Column({
    type: 'enum',
    enum: GolTarif,
    enumName: 'gol_tarif_enum',
  })
  tariff_group: GolTarif;

  @Column({ type: 'varchar', length: 50 })
  power_limit: string;

  @OneToMany(() => MonitoringInfo, (m) => m.cost)
  monitoringInfos: MonitoringInfo[];

  @OneToMany(() => CostHistory, (h) => h.cost)
  histories!: CostHistory[];
}
