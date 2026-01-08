// src/modules/costs/costs.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, DataSource, IsNull } from 'typeorm';
import { Cost } from '../../database/entities/cost.entity';
import { CostHistory } from '../../database/entities/cost-history.entity';
import { ListCostQueryDto } from './dto/list-cost.query.dto';
import { CreateCostHistoryDto } from './dto/create-cost-history.dto';

function toDateOnly(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type LatestRow = {
  cost_id: number;
  tariff_group: string;
  power_limit: string;
  cost_value: string | null;
  valid_from: string | null;
  valid_to: string | null;
};

@Injectable()
export class CostsService {
  constructor(
    private readonly ds: DataSource,
    @InjectRepository(Cost) private readonly costRepo: Repository<Cost>,
    @InjectRepository(CostHistory) private readonly histRepo: Repository<CostHistory>,
  ) {}

  async listHistory(q: ListCostQueryDto) {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    const from = toDateOnly(q.from);
    const to = toDateOnly(q.to);

    const qb = this.histRepo
      .createQueryBuilder('ch')
      .innerJoin(Cost, 'c', 'c.cost_id = ch.cost_id')
      .select([
        'c.cost_id AS cost_id',
        'c.tariff_group AS tariff_group',
        'c.power_limit AS power_limit',
        'ch.history_id AS history_id',
        'ch.cost_value AS cost_value',
        'ch.valid_from AS valid_from',
        'ch.valid_to AS valid_to',
      ]);

    if (q.search?.trim()) {
      qb.andWhere('LOWER(c.power_limit) LIKE LOWER(:kw)', { kw: `%${q.search.trim()}%` });
    }
    if (from) {
      qb.andWhere(
        new Brackets((sq) => {
          sq.where('ch.valid_to IS NULL').orWhere('ch.valid_to >= :from', { from });
        }),
      );
    }
    if (to) {
      qb.andWhere('ch.valid_from <= :to', { to });
    }

    qb.orderBy('c.cost_id', 'ASC').addOrderBy('ch.valid_from', 'DESC');

    const total = await qb.getCount();
    const rows = await qb.offset(offset).limit(pageSize).getRawMany<{
      cost_id: number;
      tariff_group: string;
      power_limit: string;
      history_id: number;
      cost_value: string;
      valid_from: string;
      valid_to: string | null;
    }>();

    return { total, rows };
  }

  /** Harga terkini per power limit */
  async listLatest(): Promise<{ total: number; rows: LatestRow[] }> {
    const raw: unknown = await this.ds.query(`
      SELECT DISTINCT ON (c.cost_id)
        c.cost_id,
        c.tariff_group,
        c.power_limit,
        ch.cost_value,
        ch.valid_from,
        ch.valid_to
      FROM cost c
      LEFT JOIN LATERAL (
        SELECT *
        FROM cost_history h
        WHERE h.cost_id = c.cost_id
        ORDER BY (h.valid_to IS NULL) DESC, h.valid_from DESC
        LIMIT 1
      ) ch ON TRUE
      ORDER BY c.cost_id ASC, (ch.valid_to IS NULL) DESC, ch.valid_from DESC;
    `);

    const rows: LatestRow[] = Array.isArray(raw) ? (raw as LatestRow[]) : [];
    return { total: rows.length, rows };
  }

  async insertPriceChange(dto: CreateCostHistoryDto) {
    const dateFrom = toDateOnly(dto.dateFrom);
    if (!dateFrom) throw new BadRequestException('dateFrom tidak valid');

    const cost = await this.costRepo.findOne({ where: { cost_id: dto.costId } });
    if (!cost) throw new BadRequestException('costId tidak ditemukan');

    return await this.ds.transaction(async (manager) => {
      const open: CostHistory | null = await manager.getRepository(CostHistory).findOne({
        where: { cost: { cost_id: dto.costId }, valid_to: IsNull() }, // <<< gunakan IsNull
        order: { valid_from: 'DESC' },
        relations: { cost: true },
      });

      if (open) {
        if (new Date(dateFrom) <= new Date(open.valid_from)) {
          throw new BadRequestException(
            `dateFrom harus > ${open.valid_from} karena harga lama mulai berlaku di tanggal tersebut`,
          );
        }
        await manager
          .getRepository(CostHistory)
          .update({ history_id: open.history_id }, { valid_to: dateFrom });
      }

      const created = manager.getRepository(CostHistory).create({
        cost,
        cost_value: String(dto.costValue),
        valid_from: dateFrom,
        valid_to: null,
      } as Partial<CostHistory>);

      const saved = await manager.getRepository(CostHistory).save(created);

      return { message: 'OK', history_id: saved.history_id };
    });
  }

  async options() {
    const rows = await this.costRepo.find({
      select: { cost_id: true, tariff_group: true, power_limit: true },
      order: { cost_id: 'ASC' },
    });

    return rows.map((r) => ({
      costId: r.cost_id,
      label: `${r.tariff_group} — ${r.power_limit}`,
    }));
  }
}
