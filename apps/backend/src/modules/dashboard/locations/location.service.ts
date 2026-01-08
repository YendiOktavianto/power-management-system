// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, SelectQueryBuilder } from 'typeorm';
// import { LocationMarkerDto } from './dto/location-maker.dto';

// import { Location } from '../../../database/entities/location.entity';
// import { MonitoringInfo } from '../../../database/entities/monitoring-info.entity';

// // Bentuk row mentah dari getRawMany()
// type RawRow = {
//   deviceId: string;
//   segment: string | null;
//   addressName: string | null;
//   detailAddressName: string | null;
//   latitude: number | null;
//   longitude: number | null;
//   lastDate?: string | null; // 'YYYY-MM-DD'
//   lastTime?: string | null; // 'HH:MM:SS'
//   diffSec?: number | null;
//   statusSql: 'Active' | 'Inactive' | null;
// };

// @Injectable()
// export class LocationService {
//   constructor(
//     @InjectRepository(Location) private readonly locRepo: Repository<Location>,
//     @InjectRepository(MonitoringInfo) private readonly monRepo: Repository<MonitoringInfo>,
//   ) {}

//   private toDate(dateStr?: string | null, timeStr?: string | null): Date | null {
//     if (!dateStr || !timeStr) return null;
//     // buang fraksi detik (contoh '10:15:34.123456' -> '10:15:34')
//     const t = timeStr.split('.')[0] ?? timeStr;
//     const iso = `${dateStr}T${t.length === 8 ? t : `${t}:00`}`; // jaga-jaga kalau 'HH:MM'
//     const d = new Date(iso);
//     return isNaN(d.getTime()) ? null : d;
//   }

//   // location.service.ts (PostgreSQL + TypeORM)
//   async findMarkersByUser(userId: string): Promise<LocationMarkerDto[]> {
//     const THRESH_SEC = Number(process.env.DEVICE_OFFLINE_SEC ?? 30);
//     const tz = (process.env.LOCAL_TZ ?? 'Asia/Jakarta').replace(/'/g, "''");

//     const deviceIdsQB = this.locRepo
//       .createQueryBuilder('loc')
//       .leftJoin('loc.device', 'gi')
//       .select('gi.device_id', 'device_id')
//       .where('gi.user_id = :uid', { uid: userId });

//     // 2) Subquery "last row per device" yang sudah DIFILTER hanya device milik user
//     const lastPerDeviceQB: SelectQueryBuilder<MonitoringInfo> =
//       this.monRepo.createQueryBuilder('m');

//     const lastPerDeviceSub = lastPerDeviceQB
//       .select(['m.device_id AS device_id', '"m"."date"  AS "date"', '"m"."time"  AS "time"'])
//       .where(`m.device_id IN (${deviceIdsQB.getQuery()})`)
//       .setParameters(deviceIdsQB.getParameters())
//       .distinctOn(['m.device_id']) // Postgres: cepat bila ada index
//       .orderBy('m.device_id', 'ASC')
//       .addOrderBy('m.monitoring_info_id', 'DESC') // baris paling baru per device
//       .getQuery();

//     const qb = this.locRepo
//       .createQueryBuilder('loc')
//       .leftJoin('loc.device', 'gi')
//       .leftJoin('loc.address', 'addr')
//       .leftJoin(`(${lastPerDeviceSub})`, 'last', 'last.device_id = gi.device_id')
//       .where('gi.user_id = :uid', { uid: userId })
//       .select([
//         'gi.device_id AS "deviceId"',
//         'loc.segment AS "segment"',
//         'addr.address_name AS "addressName"',
//         'addr.detail_address_name AS "detailAddressName"',
//         'addr.latitude AS "latitude"',
//         'addr.longitude AS "longitude"',
//         // ⬇️ kalau belum pernah insert ⇒ Inactive
//         `CASE
//           WHEN "last"."date" IS NULL OR "last"."time" IS NULL THEN 'Inactive'
//           WHEN EXTRACT(EPOCH FROM ((NOW() AT TIME ZONE '${tz}') - ("last"."date" + "last"."time"))) <= ${THRESH_SEC}
//             THEN 'Active'
//           ELSE 'Inactive'
//         END AS "statusSql"`,
//       ])
//       .orderBy('gi.device_id', 'ASC');

//     const rows = await qb.getRawMany<RawRow>();

//     return rows.map((r) => {
//       const diff = Number(r.diffSec);
//       const status: 'Active' | 'Inactive' =
//         Number.isFinite(diff) && diff <= THRESH_SEC ? 'Active' : 'Inactive';

//       return {
//         deviceId: String(r.deviceId),
//         segment: r.segment ?? null,
//         status: r.statusSql as 'Active' | 'Inactive', // ⬅️ sesuai DTO mu
//         addressName: r.addressName ?? null,
//         detailAddressName: r.detailAddressName ?? null,
//         latitude: r.latitude ?? null,
//         longitude: r.longitude ?? null,
//       };
//     });
//   }
// }
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { LocationMarkerDto } from './dto/location-maker.dto';

import { Location } from '../../../database/entities/location.entity';
import { MonitoringInfo } from '../../../database/entities/monitoring-info.entity';

// Bentuk row mentah dari getRawMany()
type RawRow = {
  deviceId: string;
  segment: string | null;
  addressName: string | null;
  detailAddressName: string | null;
  latitude: number | null;
  longitude: number | null;
  lastDate?: string | null; // 'YYYY-MM-DD'
  lastTime?: string | null; // 'HH:MM:SS'
  diffSec?: number | null;
  statusSql: 'Active' | 'Inactive' | null;
  username?: string | null;
  serialNumber?: string | null;
};

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location) private readonly locRepo: Repository<Location>,
    @InjectRepository(MonitoringInfo) private readonly monRepo: Repository<MonitoringInfo>,
  ) {}

  private toDate(dateStr?: string | null, timeStr?: string | null): Date | null {
    if (!dateStr || !timeStr) return null;
    const t = timeStr.split('.')[0] ?? timeStr;
    const iso = `${dateStr}T${t.length === 8 ? t : `${t}:00`}`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }

  // 🔹 USER: hanya device milik user tertentu
  async findMarkersByUser(userId: string): Promise<LocationMarkerDto[]> {
    const THRESH_SEC = Number(process.env.DEVICE_OFFLINE_SEC ?? 15);
    const tz = (process.env.LOCAL_TZ ?? 'Asia/Jakarta').replace(/'/g, "''");

    // 1) Ambil semua device milik user
    const deviceIdsQB = this.locRepo
      .createQueryBuilder('loc')
      .leftJoin('loc.device', 'gi')
      .select('gi.device_id', 'device_id')
      .where('gi.user_id = :uid', { uid: userId });

    // 2) Subquery "last row per device" yang sudah DIFILTER hanya device milik user
    const lastPerDeviceQB: SelectQueryBuilder<MonitoringInfo> =
      this.monRepo.createQueryBuilder('m');

    const lastPerDeviceSub = lastPerDeviceQB
      .select(['m.device_id AS device_id', '"m"."date"  AS "date"', '"m"."time"  AS "time"'])
      .where(`m.device_id IN (${deviceIdsQB.getQuery()})`)
      .setParameters(deviceIdsQB.getParameters())
      .distinctOn(['m.device_id'])
      .orderBy('m.device_id', 'ASC')
      .addOrderBy('m.monitoring_info_id', 'DESC')
      .getQuery();

    const qb = this.locRepo
      .createQueryBuilder('loc')
      .leftJoin('loc.device', 'gi')
      .leftJoin('loc.address', 'addr')
      .leftJoin('gi.user', 'u')
      .leftJoin(`(${lastPerDeviceSub})`, 'last', 'last.device_id = gi.device_id')
      .where('gi.user_id = :uid', { uid: userId })
      .select([
        'gi.device_id AS "deviceId"',
        'gi.serial_number AS "serialNumber"',
        'loc.segment AS "segment"',
        'addr.address_name AS "addressName"',
        'addr.detail_address_name AS "detailAddressName"',
        'addr.latitude AS "latitude"',
        'addr.longitude AS "longitude"',

        // 🔥 Status device = kombinasi isActive + data monitoring
        `CASE
          WHEN gi.isActive = FALSE OR gi.isActive IS NULL THEN 'Inactive'
          WHEN "last"."date" IS NULL OR "last"."time" IS NULL THEN 'Inactive'
          WHEN EXTRACT(EPOCH FROM ((NOW() AT TIME ZONE '${tz}') - ("last"."date" + "last"."time"))) <= ${THRESH_SEC}
            THEN 'Active'
          ELSE 'Inactive'
        END AS "statusSql"`,

        // opsional: buat debug kalau perlu
        `EXTRACT(EPOCH FROM ((NOW() AT TIME ZONE '${tz}') - ("last"."date" + "last"."time"))) AS "diffSec"`,

        'u.username AS "username"',
      ])
      .orderBy('gi.device_id', 'ASC');

    // penting: forward parameter dari subquery
    qb.setParameters(lastPerDeviceQB.getParameters());

    const rows = await qb.getRawMany<RawRow>();

    return rows.map((r) => ({
      deviceId: String(r.deviceId),
      segment: r.segment ?? null,
      status: (r.statusSql ?? 'Inactive') as 'Active' | 'Inactive',
      addressName: r.addressName ?? null,
      detailAddressName: r.detailAddressName ?? null,
      latitude: r.latitude ?? null,
      longitude: r.longitude ?? null,
      username: r.username ?? null,
      serialNumber: r.serialNumber ?? null,
    }));
  }

  // 🔹 ADMIN: semua device dari semua user
  async findAllMarkers(): Promise<LocationMarkerDto[]> {
    const THRESH_SEC = Number(process.env.DEVICE_OFFLINE_SEC ?? 15);
    const tz = (process.env.LOCAL_TZ ?? 'Asia/Jakarta').replace(/'/g, "''");

    // 1) Subquery last row per device TANPA filter user
    const lastPerDeviceQB: SelectQueryBuilder<MonitoringInfo> =
      this.monRepo.createQueryBuilder('m');

    const lastPerDeviceSub = lastPerDeviceQB
      .select(['m.device_id AS device_id', '"m"."date"  AS "date"', '"m"."time"  AS "time"'])
      .distinctOn(['m.device_id'])
      .orderBy('m.device_id', 'ASC')
      .addOrderBy('m.monitoring_info_id', 'DESC')
      .getQuery();

    // 2) Join ke Location + Address + Device + User
    const qb = this.locRepo
      .createQueryBuilder('loc')
      .leftJoin('loc.device', 'gi')
      .leftJoin('loc.address', 'addr')
      .leftJoin('gi.user', 'u')
      .leftJoin(`(${lastPerDeviceSub})`, 'last', 'last.device_id = gi.device_id')
      .select([
        'gi.device_id AS "deviceId"',
        'gi.serial_number AS "serialNumber"',
        'loc.segment AS "segment"',
        'addr.address_name AS "addressName"',
        'addr.detail_address_name AS "detailAddressName"',
        'addr.latitude AS "latitude"',
        'addr.longitude AS "longitude"',

        `CASE
          WHEN gi.isActive = FALSE OR gi.isActive IS NULL THEN 'Inactive'
          WHEN "last"."date" IS NULL OR "last"."time" IS NULL THEN 'Inactive'
          WHEN EXTRACT(EPOCH FROM ((NOW() AT TIME ZONE '${tz}') - ("last"."date" + "last"."time"))) <= ${THRESH_SEC}
            THEN 'Active'
          ELSE 'Inactive'
        END AS "statusSql"`,

        `EXTRACT(EPOCH FROM ((NOW() AT TIME ZONE '${tz}') - ("last"."date" + "last"."time"))) AS "diffSec"`,

        'u.username AS "username"',
      ])
      .orderBy('gi.device_id', 'ASC');

    qb.setParameters(lastPerDeviceQB.getParameters());

    const rows = await qb.getRawMany<RawRow>();

    return rows.map((r) => ({
      deviceId: String(r.deviceId),
      segment: r.segment ?? null,
      status: (r.statusSql ?? 'Inactive') as 'Active' | 'Inactive',
      addressName: r.addressName ?? null,
      detailAddressName: r.detailAddressName ?? null,
      latitude: r.latitude ?? null,
      longitude: r.longitude ?? null,
      username: r.username ?? null,
      serialNumber: r.serialNumber ?? null,
    }));
  }
}
