// apps/backend/src/modules/general-info/general-info.service.ts
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHmac, timingSafeEqual } from 'crypto';
import { GeneralInfo } from '../../database/entities/general-info.entity';
import { Address } from '../../database/entities/address.entity';
import { LocationService } from '../shared/location.service';
import { MonitoringInfo } from '../../database/entities/monitoring-info.entity';

type DetailRow = {
  deviceid: number | string;
  serialnumber: string | null;
  wattagephase: string | null;
  segment: string | null;
  location: string | null;
  statussql: 'Active' | 'Inactive' | null;
  last_ts: string | null;
};

function isDetailRow(x: unknown): x is DetailRow {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  const id = o.deviceid;

  if (typeof id === 'number' && Number.isFinite(id)) return true;
  if (typeof id === 'string' && id.trim().length > 0) return true;

  return false;
}

@Injectable()
export class GeneralInfoService {
  private secret = process.env.QR_SECRET || process.env.JWT_SECRET || 'dev-secret';

  // 🔹 memory flag: (userId, deviceId) yang sudah diverifikasi
  //    – cukup untuk PoC / localhost / single instance
  private unlockedMap = new Map<string, Set<number>>();

  constructor(
    @InjectRepository(GeneralInfo)
    private readonly giRepo: Repository<GeneralInfo>,
    @InjectRepository(Address)
    private readonly addrRepo: Repository<Address>,
    @InjectRepository(MonitoringInfo)
    private readonly monRepo: Repository<MonitoringInfo>,
    private readonly locationSvc: LocationService,
  ) {}

  private signPayload(deviceId: number, userId: string): string {
    const data = `${deviceId}.${userId}`;
    const sig = createHmac('sha256', this.secret).update(data).digest('base64url');
    return `${data}.${sig}`;
  }

  private verifyPayload(token: string, expectedDeviceId: number, userId: string): boolean {
    const parts = token?.split('.') ?? [];
    if (parts.length !== 3) return false;
    const [idStr, uid, sig] = parts;
    if (uid !== userId) return false;

    const devId = Number(idStr);
    if (!Number.isFinite(devId) || devId !== expectedDeviceId) return false;

    const expected = createHmac('sha256', this.secret)
      .update(`${devId}.${uid}`)
      .digest('base64url');
    try {
      return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  // 🔹 helper memory unlock
  private markUnlocked(userId: string, deviceId: number) {
    const key = userId;
    let set = this.unlockedMap.get(key);
    if (!set) {
      set = new Set<number>();
      this.unlockedMap.set(key, set);
    }
    set.add(deviceId);
  }

  private isUnlocked(userId: string, deviceId: number): boolean {
    const set = this.unlockedMap.get(userId);
    return !!set && set.has(deviceId);
  }

  async listDevices(userId: string, email?: string) {
    const sql = `
      SELECT
        g.device_id AS "deviceId",
        g.serial_number AS "serialNumber",
        CONCAT(COALESCE(g.wattage,''), ' / ', COALESCE(g.phase,'')) AS "wattagePhase",
        l.segment AS "segment",
        CONCAT(
          COALESCE(a.address_name, ''),
          CASE 
            WHEN a.detail_address_name IS NOT NULL AND a.detail_address_name <> '' 
            THEN ' - ' || a.detail_address_name 
            ELSE '' 
          END
        ) AS "location"
      FROM general_info g
      LEFT JOIN location l ON l.device_id = g.device_id
      LEFT JOIN address  a ON a.address_id = l.address_id
      WHERE g.user_id = $1
      ORDER BY g.device_id ASC
    `;

    const rows = (await this.giRepo.query(sql, [userId])) as any[];

    return {
      meta: { count: rows.length },
      data: rows,
    };
  }

  // 🔹 QR berisi URL FE (bukan lagi ems://)
  async getQrToken(userId: string, email: string | undefined, deviceId: number) {
    if (!deviceId) throw new BadRequestException('deviceId required');

    await this.locationSvc.guardDeviceOwnership(userId, email, deviceId);

    const token = this.signPayload(deviceId, userId);

    // base FE – untuk localhost bisa http://localhost:3000
    // untuk HP + laptop beda device: pakai IP LAN, misalnya http://192.168.1.10:3000
    const base = (process.env.FRONTEND_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const qrPayload = `${base}/dashboard/general-info?deviceId=${deviceId}&token=${token}`;

    return { deviceId, token, qrPayload };
  }

  // 🔹 HP (atau browser manapun) panggil ini → set flag unlocked
  async verifyToken(userId: string, email: string | undefined, deviceId: number, token: string) {
    await this.locationSvc.guardDeviceOwnership(userId, email, deviceId);
    const ok = this.verifyPayload(token, deviceId, userId);
    if (!ok) throw new ForbiddenException('QR token invalid');

    // ✅ remote unlock: tandai (userId, deviceId) sebagai unlocked
    this.markUnlocked(userId, deviceId);

    return { ok: true, deviceId };
  }

  // 🔹 dipanggil FE laptop (polling) tanpa token
  async getUnlockStatus(userId: string, email: string | undefined, deviceId: number) {
    await this.locationSvc.guardDeviceOwnership(userId, email, deviceId);
    const unlocked = this.isUnlocked(userId, deviceId);
    return { deviceId, unlocked };
  }

  async getDetail(userId: string, email: string | undefined, deviceId: number, token?: string) {
    await this.locationSvc.guardDeviceOwnership(userId, email, deviceId);

    // 🔹 dua sumber "unlocked":
    // 1) token valid (scanner langsung buka detail)
    // 2) flag remote unlock (HP sudah verify)
    const unlockedByToken = !!token && this.verifyPayload(token, deviceId, userId);
    const unlockedByFlag = this.isUnlocked(userId, deviceId);
    const unlocked = unlockedByToken || unlockedByFlag;

    const THRESH_SEC = Number(process.env.DEVICE_OFFLINE_SEC ?? 30);
    const tz = (process.env.LOCAL_TZ ?? 'Asia/Jakarta').replace(/'/g, "''");

    const sql = `
      SELECT
        g.device_id AS deviceid,
        g.serial_number AS serialnumber,
        CONCAT(COALESCE(g.wattage,''), ' / ', COALESCE(g.phase,'')) AS wattagephase,
        l.segment AS segment,
        CONCAT(COALESCE(a.address_name,''), ' - ', COALESCE(a.detail_address_name,'')) AS location,
        CASE
          WHEN last.date IS NULL OR last.time IS NULL THEN 'Inactive'
          WHEN EXTRACT(EPOCH FROM ((NOW() AT TIME ZONE '${tz}') - (last.date + last.time))) <= ${THRESH_SEC}
            THEN 'Active'
          ELSE 'Inactive'
        END AS statussql,
        (last.date + last.time) AS last_ts
      FROM general_info g
      LEFT JOIN location l ON l.device_id = g.device_id
      LEFT JOIN address  a ON a.address_id = l.address_id
      LEFT JOIN (
        SELECT m.device_id, m.date, m.time
        FROM monitoring_info m
        WHERE m.device_id = $1
        ORDER BY m.monitoring_info_id DESC
        LIMIT 1
      ) last ON last.device_id = g.device_id
      WHERE g.device_id = $1
    `;

    const resultUnknown: unknown = await this.giRepo.query(sql, [deviceId]);
    const rowUnknown = Array.isArray(resultUnknown) ? resultUnknown[0] : undefined;

    if (!rowUnknown || !isDetailRow(rowUnknown)) {
      throw new BadRequestException('Device not found');
    }

    const devIdNum = Number(rowUnknown.deviceid);
    const row: DetailRow = {
      deviceid: Number.isFinite(devIdNum) ? devIdNum : deviceId,
      serialnumber: rowUnknown.serialnumber ?? null,
      wattagephase: rowUnknown.wattagephase ?? null,
      segment: rowUnknown.segment ?? null,
      location: rowUnknown.location ?? null,
      statussql: (rowUnknown.statussql as any) ?? null,
      last_ts: rowUnknown.last_ts ?? null,
    };

    if (!unlocked) {
      return {
        deviceId: row.deviceid ?? deviceId,
        unlocked: false,
      };
    }

    return {
      deviceId: row.deviceid ?? deviceId,
      serialNumber: row.serialnumber ?? null,
      wattagePhase: row.wattagephase ?? null,
      segment: row.segment ?? null,
      location: row.location ?? null,
      powerState: row.statussql ?? 'Inactive',
      lastUpdate: row.last_ts ? new Date(row.last_ts).toISOString() : null,
      unlocked: true,
    };
  }
}
