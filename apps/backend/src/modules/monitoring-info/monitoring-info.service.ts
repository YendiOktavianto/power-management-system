import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource, IsNull, EntityManager } from 'typeorm';
import { MonitoringInfo } from '../../database/entities/monitoring-info.entity';
import { GeneralInfo } from '../../database/entities/general-info.entity';
import { CreateMonitoringInfoDto } from './dto/create-monitoring-info.dto';
import { Subject } from 'rxjs';
import { DeepPartial } from 'typeorm';
import { Address } from '../../database/entities/address.entity';
import { Location } from '../../database/entities/location.entity';
import { Cost } from '../../database/entities/cost.entity';
import { CostHistory } from '../../database/entities/cost-history.entity';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';

function fmtWattPhase(wattage?: number | string | null, phase?: number | string | null) {
  // wattage → “<angka>VA” (biarkan kalau sudah ada satuan)
  const w =
    wattage == null || wattage === ''
      ? ''
      : typeof wattage === 'number'
        ? `${wattage}VA`
        : /(?:VA|kVA|W)$/i.test(wattage)
          ? wattage.trim()
          : `${wattage}VA`;

  // phase → “<n>-Phase” (support “1”, “1-Phase”, “Single”, “Three Phase”, dll.)
  let p = '';
  if (phase != null && phase !== '') {
    if (typeof phase === 'number') p = `${phase}-Phase`;
    else {
      const s = String(phase).trim();
      const m = s.match(/\d+/);
      p = m ? `${m[0]}-Phase` : /(?:phase)/i.test(s) ? s : `${s}-Phase`;
    }
  }

  return [w, p].filter(Boolean).join(' / ');
}

@Injectable()
export class MonitoringInfoService {
  constructor(
    @InjectRepository(MonitoringInfo)
    private readonly repo: Repository<MonitoringInfo>,
    @InjectRepository(GeneralInfo)
    private readonly genRepo: Repository<GeneralInfo>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    @InjectRepository(Cost)
    private readonly costRepo: Repository<Cost>,
    @InjectRepository(CostHistory)
    private readonly histRepo: Repository<CostHistory>,
    private readonly dataSource: DataSource,
  ) {}

  readonly stream$ = new Subject<MonitoringInfo>();

  async getHeader(deviceId: number) {
    // Join pakai entity class agar aman terhadap rename table/alias
    const raw = await this.genRepo
      .createQueryBuilder('g')
      .leftJoin(Location, 'l', 'l.device_id = g.device_id')
      .leftJoin(Address, 'a', 'a.address_id = l.address_id')
      .select([
        'g.serial_number AS serial_number',
        'g.wattage       AS wattage',
        'g.phase         AS phase',
        'l.segment       AS segment',
        'a.address_name        AS address_name',
        'a.detail_address_name AS detail_address_name',
      ])
      .where('g.device_id = :deviceId', { deviceId })
      .getRawOne<{
        serial_number: string | null;
        wattage: string | number | null;
        phase: string | null;
        segment: string | null;
        address_name: string | null;
        detail_address_name: string | null;
      }>();

    return {
      serial_number: raw?.serial_number ?? null,
      // contoh tampilan: "Rumah Utama | Jl. Merdeka No. 10, Salatiga"
      location: raw
        ? [raw.address_name, raw.detail_address_name].filter(Boolean).join(' | ')
        : null,
      wattage: raw?.wattage ?? null,
      phase: raw?.phase ?? null,
      segment: raw?.segment ?? null,
    };
  }

  async findMine(userId: number) {
    const rows = await this.genRepo
      .createQueryBuilder('g')
      .leftJoin('g.location', 'loc')
      .leftJoin('loc.address', 'addr')
      .select([
        'g.device_id        AS device_id',
        'g.serial_number    AS serial_number',
        'g.wattage          AS wattage',
        'g.phase            AS phase',
        'loc.segment        AS segment',
        'addr.address_name  AS address_name',
        'addr.detail_address_name AS detail_address_name',
      ])
      .where('g.user_id = :userId', { userId })
      .orderBy('g.serial_number', 'ASC')
      .getRawMany<{
        device_id: number;
        serial_number: string;
        wattage: string | null;
        phase: string | null;
        segment: string | null;
        address_name: string | null;
        detail_address_name: string | null;
      }>();

    return rows.map((r) => ({
      device_id: r.device_id,
      serial_number: r.serial_number,
      address_name: r.address_name ?? '',
      detail_location: r.detail_address_name ?? '',
      watt_phase: fmtWattPhase(r.wattage, r.phase),
      segment: r.segment ?? '',
    }));
  }

  async ingest(dto: CreateMonitoringInfoDto) {
    const ts = new Date(`${dto.date}T${dto.time}`);

    return this.dataSource.transaction(async (trx) => {
      const monRepo = trx.getRepository(MonitoringInfo);
      const genRepo = trx.getRepository(GeneralInfo);

      const dev = await genRepo.findOne({ where: { device_id: dto.device_id } });
      if (!dev) throw new NotFoundException('Device not found');

      const prev = await monRepo
        .createQueryBuilder('m')
        .setLock('pessimistic_write')
        .where('m.device_id = :id', { id: dto.device_id })
        .orderBy('m.date', 'DESC')
        .addOrderBy('m.time', 'DESC')
        .getOne();

      const sameDay = prev ? prev.date === dto.date : false;
      const sameMonth = prev ? prev.date.slice(0, 7) === dto.date.slice(0, 7) : false;

      const num = (v: unknown) => (v == null ? null : Number(v));

      const totalNow = num(dto.total_energy_usage) ?? 0; // kWh dari device
      const prevTot = prev?.total_energy_usage != null ? Number(prev.total_energy_usage) : null;

      let incKwh = 0;
      if (prevTot != null) {
        incKwh = Math.max(0, totalNow - prevTot);
      } else {
        const hwTodayKwh = num(dto.total_energy_usage_today);
        incKwh = hwTodayKwh != null && hwTodayKwh > 0 ? hwTodayKwh : totalNow;
      }

      let todayKwh: number;
      if (sameDay && prev?.total_energy_usage_today != null) {
        todayKwh = Number(prev.total_energy_usage_today) + incKwh;
      } else {
        const hwTodayKwh = num(dto.total_energy_usage_today);
        todayKwh = hwTodayKwh != null && hwTodayKwh >= 0 ? hwTodayKwh : incKwh;
      }

      let mtdKwh: number;
      if (sameMonth && prev?.total_energy_usage_mtd != null) {
        mtdKwh = Number(prev.total_energy_usage_mtd) + incKwh;
      } else {
        const hwMtdKwh = num(dto.total_energy_usage_mtd);
        mtdKwh = hwMtdKwh != null && hwMtdKwh >= 0 ? hwMtdKwh : incKwh;
      }

      // HARGA AKTIF dari cost_history berdasarkan cost_id yg dikirim hardware
      const { pricePerKwh, costIdForRow } = await this.resolveActivePriceByCostId(
        trx,
        dto.cost_id ?? null,
        ts,
      );

      // BIAYA: increment dan akumulasi
      const costInc = incKwh * pricePerKwh;

      const prevTotalCost = prev?.total_energy_cost != null ? Number(prev.total_energy_cost) : 0;
      const prevTodayCost =
        sameDay && prev?.total_energy_cost_today != null ? Number(prev.total_energy_cost_today) : 0;
      const prevMtdCost =
        sameMonth && prev?.total_energy_cost_mtd != null ? Number(prev.total_energy_cost_mtd) : 0;

      const totalCost = prevTotalCost + costInc;

      // untuk baris pertama hari/bulan, sinkronkan dengan usage yang baru dihitung
      const todayCost = sameDay ? prevTodayCost + costInc : todayKwh * pricePerKwh;
      const mtdCost = sameMonth ? prevMtdCost + costInc : mtdKwh * pricePerKwh;

      // SIMPAN
      const row = monRepo.create({
        date: dto.date,
        time: dto.time,

        voltage: dto.voltage != null ? String(dto.voltage) : null,
        current: dto.current != null ? String(dto.current) : null,
        frequency: dto.frequency != null ? String(dto.frequency) : null,
        power_factor: dto.power_factor != null ? String(dto.power_factor) : null,
        power: dto.power != null ? String(dto.power) : null,

        total_energy_usage: String(totalNow),
        total_energy_usage_today: String(todayKwh),
        total_energy_usage_mtd: String(mtdKwh),

        total_energy_cost: String(totalCost),
        total_energy_cost_today: String(todayCost),
        total_energy_cost_mtd: String(mtdCost),

        cost: costIdForRow ? ({ cost_id: costIdForRow } as unknown as Cost) : null,
        device: { device_id: dto.device_id } as unknown as GeneralInfo,
      } as DeepPartial<MonitoringInfo>);

      const saved = await monRepo.save(row);
      this.stream$.next(saved);
      return saved;
    });
  }

  private async resolveActivePriceByCostId(
    em: EntityManager,
    costId: number | null,
    at: Date, // pakai Date, bukan string
  ): Promise<{ pricePerKwh: number; costIdForRow: number | null }> {
    if (!costId) return { pricePerKwh: 0, costIdForRow: null };

    const cost = await em.getRepository(Cost).findOne({ where: { cost_id: costId } });
    if (!cost) return { pricePerKwh: 0, costIdForRow: null };

    const hist = await em
      .getRepository(CostHistory)
      .createQueryBuilder('h')
      .where('h.cost_id = :cid', { cid: costId })
      .andWhere('h.valid_from <= :ts', { ts: at })
      .andWhere('(h.valid_to IS NULL OR :ts < h.valid_to)', { ts: at })
      .orderBy('h.valid_from', 'DESC')
      .getOne();

    if (hist) {
      return { pricePerKwh: Number(hist.cost_value), costIdForRow: costId };
    }

    const latest = await em.getRepository(CostHistory).findOne({
      where: { cost: { cost_id: costId }, valid_to: IsNull() },
      order: { valid_from: 'DESC' },
    });

    return {
      pricePerKwh: latest ? Number(latest.cost_value) : 0,
      costIdForRow: latest ? costId : null,
    };
  }

  async latest(deviceId: number) {
    const row = await this.repo.findOne({
      where: { device: { device_id: deviceId } },
      order: { date: 'DESC', time: 'DESC' },
    });
    return row ?? null;
  }

  async seriesByDate(deviceId: number, date: string) {
    return this.repo.find({
      where: { device: { device_id: deviceId }, date },
      order: { time: 'ASC' },
    });
  }

  async seriesRange(deviceId: number, fromISO: string, toISO: string) {
    const fromDate = fromISO.substring(0, 10);
    const toDate = toISO.substring(0, 10);
    return this.repo.find({
      where: { device: { device_id: deviceId }, date: Between(fromDate, toDate) },
      order: { date: 'ASC', time: 'ASC' },
    });
  }
}
