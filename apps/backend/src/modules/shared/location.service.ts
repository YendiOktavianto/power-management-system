import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralInfo } from '../../database/entities/general-info.entity';
import { Address } from '../../database/entities/address.entity';

type LocationRow = {
  deviceId: number;
  serialNumber: string;
  segment: string;
  wattagePhase: string;
  location: string;
};

@Injectable()
export class LocationService {
  constructor(@InjectRepository(GeneralInfo) private readonly giRepo: Repository<GeneralInfo>) {}

  async listUserLocations(userId: string, email: string) {
    const rows = await this.giRepo
      .createQueryBuilder('g')
      .innerJoin('users', 'u', 'u."userId" = g.user_id')
      .leftJoin('location', 'l', 'l.device_id = g.device_id')
      .leftJoin(Address, 'a', 'a.address_id = l.address_id')
      .where('(g.user_id = :userId OR u.email = :email)', { userId, email })
      .select([
        'g.device_id AS deviceId',
        'g.serial_number AS serialNumber',
        'l.segment AS segment',
        "CASE WHEN g.wattage IS NULL OR g.phase IS NULL THEN '' ELSE CONCAT(g.wattage,' / ',g.phase,'-Phase') END AS wattagePhase",
        "TRIM(CONCAT(COALESCE(a.address_name,''),' - ',COALESCE(a.detail_address_name,''))) AS location",
      ])
      .orderBy('a.address_name', 'ASC')
      .getRawMany<LocationRow>();

    return { meta: { totalDevices: rows.length }, data: rows };
  }

  async listAllLocations() {
    const rows = await this.giRepo
      .createQueryBuilder('g')
      .leftJoin('location', 'l', 'l.device_id = g.device_id')
      .leftJoin(Address, 'a', 'a.address_id = l.address_id')
      .select([
        'g.device_id AS deviceId',
        'g.serial_number AS serialNumber',
        'l.segment AS segment',
        "CASE WHEN g.wattage IS NULL OR g.phase IS NULL THEN '' ELSE CONCAT(g.wattage,' / ',g.phase,'-Phase') END AS wattagePhase",
        "TRIM(CONCAT(COALESCE(a.address_name,''),' - ',COALESCE(a.detail_address_name,''))) AS location",
      ])
      .orderBy('a.address_name', 'ASC')
      .getRawMany<{
        deviceId: number;
        serialNumber: string;
        segment: string;
        wattagePhase: string;
        location: string;
      }>();

    return { meta: { totalDevices: rows.length }, data: rows };
  }

  async guardDeviceOwnership(
    userId: string | undefined,
    email: string | undefined,
    deviceId: number,
  ) {
    const qb = this.giRepo.createQueryBuilder('g').where('g.device_id = :deviceId', { deviceId });

    // JOIN users hanya jika pakai email di WHERE
    if (email) {
      qb.innerJoin('users', 'u', 'u."userId" = g.user_id');
    }

    if (userId && email) {
      qb.andWhere('(g.user_id = :userId OR u.email = :email)', { userId, email });
    } else if (userId) {
      qb.andWhere('g.user_id = :userId', { userId });
    } else if (email) {
      qb.andWhere('u.email = :email', { email });
    } else {
      throw new BadRequestException('Missing user identity (sub/email)');
    }

    const owned = await qb.select('g.device_id', 'deviceId').getRawOne<{ deviceId: number }>();

    if (!owned) throw new ForbiddenException('Device tidak dimiliki user ini');
  }
}
