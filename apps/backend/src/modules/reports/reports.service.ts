// apps/backend/src/modules/reports/reports.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonitoringInfo } from '../../database/entities/monitoring-info.entity';
import { ReportQueryDto } from './dto/report-query.dto';
import { dateTimeExpr } from './utils/datetime';

type UserScopedReportQuery = ReportQueryDto & { userId?: number };

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(MonitoringInfo)
    private readonly repo: Repository<MonitoringInfo>,
  ) {}

  private async raw<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    return await this.repo.query(sql, params);
  }

  /** Summary Report: voltage, current, frequency, cos phi, power */
  async summaryReport(q: UserScopedReportQuery) {
    const page = Number(q.page ?? 1);
    const pageSize = Number(q.pageSize ?? 10000000);
    const offset = (page - 1) * pageSize;

    const base = this.repo
      .createQueryBuilder('mi')
      .innerJoin('general_info', 'g', 'g.device_id = mi.device_id')
      .innerJoin('location', 'loc', 'loc.device_id = mi.device_id')
      .innerJoin('address', 'addr', 'addr.address_id = loc.address_id');

    if (q.deviceId) {
      base.andWhere('mi.device_id = :deviceId', {
        deviceId: Number(q.deviceId),
      });
    }

    if (q.userId != null) {
      base.andWhere('g.user_id = :userId', { userId: q.userId });
    }

    if (q.from && q.to) {
      base.andWhere(`${dateTimeExpr()} BETWEEN :from AND :to`, {
        from: q.from,
        to: q.to,
      });
    } else if (q.from) {
      base.andWhere(`${dateTimeExpr()} >= :from`, { from: q.from });
    } else if (q.to) {
      base.andWhere(`${dateTimeExpr()} <= :to`, { to: q.to });
    }

    const total = await base.getCount();

    const rows = await base
      .clone()
      .select([
        'ROW_NUMBER() OVER (PARTITION BY mi.device_id ORDER BY mi.date, mi.time) AS serial',
        'mi.date AS date',
        'mi.time AS time',
        'mi.voltage AS voltage',
        'mi.current AS current',
        'mi.frequency AS frequency',
        'mi.power_factor AS cos_phi',
        'mi.power AS power',
        'addr.address_name AS address_name',
        'addr.detail_address_name AS detail_address_name',
      ])
      .orderBy('mi.date', 'ASC')
      .addOrderBy('mi.time', 'ASC')
      .offset(offset)
      .limit(pageSize)
      .getRawMany();

    return { total, rows };
  }

  async energyReport(q: UserScopedReportQuery) {
    return this.getEnergyDaily(q);
  }

  async summaryReportAdmin(q: ReportQueryDto & { userId?: number }) {
    const page = Number(q.page ?? 1);
    const pageSize = Number(q.pageSize ?? 10);
    const offset = (page - 1) * pageSize;

    const base = this.repo
      .createQueryBuilder('mi')
      .innerJoin('location', 'loc', 'loc.device_id = mi.device_id')
      .innerJoin('address', 'addr', 'addr.address_id = loc.address_id');

    if (q.deviceId) {
      base.andWhere('mi.device_id = :deviceId', {
        deviceId: Number(q.deviceId),
      });
    }

    if (q.from && q.to) {
      base.andWhere(`${dateTimeExpr()} BETWEEN :from AND :to`, {
        from: q.from,
        to: q.to,
      });
    } else if (q.from) {
      base.andWhere(`${dateTimeExpr()} >= :from`, { from: q.from });
    } else if (q.to) {
      base.andWhere(`${dateTimeExpr()} <= :to`, { to: q.to });
    }

    if (q.userId != null) {
      base.andWhere('loc.user_id = :userId', { userId: q.userId });
    }

    const total = await base.getCount();

    const rows = await base
      .clone()
      .select([
        'ROW_NUMBER() OVER (ORDER BY mi.date, mi.time) AS serial',
        'mi.date AS date',
        'mi.time AS time',
        'mi.voltage AS voltage',
        'mi.current AS current',
        'mi.frequency AS frequency',
        'mi.power_factor AS cos_phi',
        'mi.power AS power',
        'addr.address_name AS address_name',
        'addr.detail_address_name AS detail_address_name',
      ])
      .orderBy('mi.date', 'ASC')
      .addOrderBy('mi.time', 'ASC')
      .offset(offset)
      .limit(pageSize)
      .getRawMany();

    return { total, page, pageSize, rows };
  }

  async energyReportAdmin(q: ReportQueryDto & { userId?: string }) {
    return this.getEnergyDaily({
      ...q,
      userId: q.userId ? Number(q.userId) : undefined,
    });
  }

  async getEnergyDaily(q: ReportQueryDto & { userId?: number }) {
    if (!q.deviceId) {
      throw new BadRequestException('deviceId is required');
    }

    if (!q.from || !q.to) {
      throw new BadRequestException('from and to are required');
    }

    const deviceId = Number(q.deviceId);
    if (!Number.isFinite(deviceId)) {
      throw new BadRequestException('Invalid deviceId');
    }

    if (q.userId != null) {
      const ownedDeviceCount = await this.repo
        .createQueryBuilder('mi')
        .innerJoin('general_info', 'g', 'g.device_id = mi.device_id')
        .where('mi.device_id = :deviceId', { deviceId })
        .andWhere('g.user_id = :userId', { userId: q.userId })
        .getCount();

      if (ownedDeviceCount === 0) {
        throw new BadRequestException('Device not found');
      }
    }

    const pageNum = Number(q.page) || 1;
    const pageSizeNum = Number(q.pageSize) || 10;
    const offset = (pageNum - 1) * pageSizeNum;

    type CountRow = { total: number };
    const totalRows = await this.raw<CountRow>(
      `
      SELECT COUNT(DISTINCT mi.date)::int AS total
      FROM monitoring_info mi
      WHERE mi.device_id = $1
        AND (mi.date + mi.time) BETWEEN $2::timestamp AND $3::timestamp
      `,
      [deviceId, q.from, q.to],
    );
    const total = Number(totalRows[0]?.total ?? 0);

    type RateRow = { rate: number | string };
    const rateRows = await this.raw<RateRow>(
      `
      SELECT ch.cost_value AS rate
      FROM cost_history ch
      WHERE ch.cost_id = (
        SELECT mi.cost_id
        FROM monitoring_info mi
        WHERE mi.device_id = $1
        ORDER BY mi.date DESC, mi.time DESC
        LIMIT 1
      )
      AND ch.valid_to IS NULL
      ORDER BY ch.valid_from DESC
      LIMIT 1
      `,
      [deviceId],
    );
    const rate = Number(rateRows[0]?.rate ?? 0);

    type AggRow = {
      serial: number;
      device_id: number;
      date: string;
      start_kwh: string | number;
      end_kwh: string | number;
      usage_kwh: string | number;
      usage_cost_kwh: string | number;
      usage_cost_per_day_idr: string | number;
    };

    const agg = await this.raw<AggRow>(
      `
      WITH range AS (
        SELECT device_id, date, time, total_energy_usage
        FROM monitoring_info
        WHERE device_id = $1
          AND (date + time) BETWEEN $2::timestamp AND $3::timestamp
      ),
      per_day AS (
        SELECT
          device_id,
          date,
          FIRST_VALUE(total_energy_usage) OVER (PARTITION BY device_id, date ORDER BY time ASC) AS start_wh,
          LAST_VALUE(total_energy_usage)  OVER (PARTITION BY device_id, date ORDER BY time ASC
            ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS end_wh
        FROM range
      ),
      days AS (
        SELECT DISTINCT device_id, date, start_wh, end_wh
        FROM per_day
      ),
      numbered AS (
        SELECT
          ROW_NUMBER() OVER (PARTITION BY device_id ORDER BY date) AS serial,
          device_id,
          date::date AS date,
          ROUND(start_wh, 3) AS start_kwh,
          ROUND(end_wh,   3) AS end_kwh,
          ROUND((end_wh - start_wh), 3) AS usage_kwh
        FROM days
      )
      SELECT
        serial,
        device_id,
        date,
        start_kwh,
        end_kwh,
        usage_kwh,
        $4::numeric AS usage_cost_kwh,
        ROUND(usage_kwh * $4::numeric, 0) AS usage_cost_per_day_idr
      FROM numbered
      ORDER BY date
      LIMIT $5 OFFSET $6
      `,
      [deviceId, q.from, q.to, rate, pageSizeNum, offset],
    );

    return {
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      rows: agg.map((r) => ({
        serial: Number(r.serial),
        data_id: Number(r.device_id),
        date: r.date,
        start_kwh: Number(r.start_kwh),
        end_kwh: Number(r.end_kwh),
        usage_kwh: Number(r.usage_kwh),
        usage_cost_kwh: Number(r.usage_cost_kwh),
        usage_cost_per_day: Number(r.usage_cost_per_day_idr),
      })),
    };
  }
}
