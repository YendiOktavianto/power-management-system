import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonitoringInfo } from '../../database/entities/monitoring-info.entity';
import { GeneralInfo } from '../../database/entities/general-info.entity';

type HomeHeaderRow = {
  deviceId: number;
  serialNumber: string;
  wattagePhase: string;
  segment: string;
};

type LatestRow = {
  voltage: string | number | null;
  frequency: string | number | null;
  power: string | number | null;
  current: string | number | null;
  power_factor: string | number | null;
  total_energy_usage_today: string | null;
  total_energy_usage_mtd: string | null;
  total_energy_cost_today: string | null;
  total_energy_cost_mtd: string | null;
  date: string | null;
  time: string | null;
};

type AggRow = { e: string; c: string };

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(MonitoringInfo) private readonly monRepo: Repository<MonitoringInfo>,
    @InjectRepository(GeneralInfo) private readonly giRepo: Repository<GeneralInfo>,
  ) {}

  async getHomeSnapshot(deviceId: number) {
    // Header: serial / wattage / segment (segment dari table location)
    const header = await this.giRepo
      .createQueryBuilder('g')
      .leftJoin('location', 'l', 'l.device_id = g.device_id')
      .where('g.device_id = :deviceId', { deviceId })
      .select([
        'g.device_id AS deviceId',
        'g.serial_number AS serialNumber',
        "CONCAT(g.wattage,' / ',g.phase,'-Phase') AS wattagePhase",
        'l.segment AS segment',
      ])
      .getRawOne<HomeHeaderRow>();

    // Record monitoring terbaru
    const latest = await this.monRepo
      .createQueryBuilder('m')
      .where('m.device_id = :deviceId', { deviceId })
      .select([
        'm.voltage AS voltage',
        'm.frequency AS frequency',
        'm.power AS power',
        'm.current AS current',
        'm.power_factor AS power_factor',
        'm.total_energy_usage_today AS total_energy_usage_today',
        'm.total_energy_usage_mtd AS total_energy_usage_mtd',
        'm.total_energy_cost_today AS total_energy_cost_today',
        'm.total_energy_cost_mtd AS total_energy_cost_mtd',
        'm.date AS date',
        'm.time AS time',
      ])
      .orderBy('m.date', 'DESC')
      .addOrderBy('m.time', 'DESC')
      .limit(1)
      .getRawOne<LatestRow>();

    // Opsi B: string untuk energy & cost (mengikuti skema)
    let todayEnergy: string | undefined = latest?.total_energy_usage_today ?? undefined;
    let mtdEnergy: string | undefined = latest?.total_energy_usage_mtd ?? undefined;
    let todayCost: string | undefined = latest?.total_energy_cost_today ?? undefined;
    let mtdCost: string | undefined = latest?.total_energy_cost_mtd ?? undefined;

    if (
      todayEnergy === undefined ||
      mtdEnergy === undefined ||
      todayCost === undefined ||
      mtdCost === undefined
    ) {
      // fallback: sum dari kolom per-record (menurut ERD)
      const today = await this.monRepo
        .createQueryBuilder('m')
        .select('COALESCE(SUM(m.total_energy_usage),0)::text', 'e')
        .addSelect('COALESCE(SUM(m.total_energy_cost),0)::text', 'c')
        .where('m.device_id = :deviceId', { deviceId })
        .andWhere('m.date = CURRENT_DATE')
        .getRawOne<AggRow>();

      const mtd = await this.monRepo
        .createQueryBuilder('m')
        .select('COALESCE(SUM(m.total_energy_usage),0)::text', 'e')
        .addSelect('COALESCE(SUM(m.total_energy_cost),0)::text', 'c')
        .where('m.device_id = :deviceId', { deviceId })
        .andWhere('EXTRACT(YEAR FROM m.date) = EXTRACT(YEAR FROM CURRENT_DATE)')
        .andWhere('EXTRACT(MONTH FROM m.date) = EXTRACT(MONTH FROM CURRENT_DATE)')
        .getRawOne<AggRow>();

      todayEnergy = today?.e ?? '0';
      todayCost = today?.c ?? '0';
      mtdEnergy = mtd?.e ?? '0';
      mtdCost = mtd?.c ?? '0';
    }

    // angka realtime (boleh number)
    const voltage = Number(latest?.voltage ?? 0);
    const frequency_hz = Number(latest?.frequency ?? 0);
    const power_watt = Number(latest?.power ?? 0);
    const current_ampere = Number(latest?.current ?? 0);
    const power_factor = Number(latest?.power_factor ?? 0);

    return {
      device: header ?? { deviceId },
      metrics: {
        voltage,
        frequency_hz,
        power_watt,
        current_ampere,
        power_factor,
        energy_kwh: { today: todayEnergy ?? '0', mtd: mtdEnergy ?? '0' },
        cost_idr: { today: todayCost ?? '0', mtd: mtdCost ?? '0' },
      },
      lastUpdate: latest?.date && latest?.time ? `${latest.date}T${latest.time}` : null,
    };
  }
}
