import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeviceDto } from './dto/create-device.dto';
import { GeneralInfo, PhaseType } from '../../database/entities/general-info.entity';
import { Location } from '../../database/entities/location.entity';
import { Address } from '../../database/entities/address.entity';
import { User } from '../../database/entities/user.entity';
import { DeviceListItemDto } from './dto/device-list-item.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

type FindAllParams = { q?: string; page?: number; limit?: number };
const toYesNo = (b: boolean | null | undefined): DeviceListItemDto['active'] => (b ? 'YES' : 'NO');
type Caller = { requesterId?: string; role?: string; username?: string };

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(GeneralInfo)
    private readonly giRepo: Repository<GeneralInfo>,
    @InjectRepository(Location) private readonly locRepo: Repository<Location>,
    @InjectRepository(Address) private readonly addrRepo: Repository<Address>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async findAll(params: FindAllParams) {
    const { q, page = 1, limit = 1000 } = params;

    const qb = this.giRepo
      .createQueryBuilder('gi')
      .leftJoin('gi.user', 'u')
      .leftJoin('gi.location', 'loc')
      .leftJoin('loc.address', 'addr')
      .select([
        'gi.device_id AS id',
        'gi.serial_number AS serial_number',
        'u.username AS username',
        'gi.wattage AS wattage',
        // di DB biasanya kolomnya phase_type; kalau namanya lain tinggal ganti di sini
        'gi.phase AS phase',
        'addr.address_name AS address_name',
        'addr.detail_address_name AS detail_address_name',
        'addr.longitude AS long',
        'addr.latitude AS lat',
        'loc.segment AS segment',
        'gi.isActive AS active',
      ])
      .orderBy('gi.serial_number', 'ASC')
      .take(limit)
      .skip((page - 1) * limit);

    if (q && q.trim()) {
      qb.andWhere(
        `
        gi.serial_number ILIKE :q OR
        u.username ILIKE :q OR
        gi.wattage ILIKE :q OR
        gi.phase ILIKE :q OR
        addr.address_name ILIKE :q OR
        addr.detail_address_name ILIKE :q OR
        loc.segment ILIKE :q OR
        CAST(addr.longitude AS TEXT) ILIKE :q OR
        CAST(addr.latitude  AS TEXT) ILIKE :q
      `,
        { q: `%${q.trim()}%` },
      );
    }

    const rows = await qb.getRawMany<{
      id: string;
      serial_number: string | null;
      username: string | null;
      wattage: string | null;
      phase: string | null;
      address_name: string | null;
      detail_address_name: string | null;
      long: number | null;
      lat: number | null;
      segment: string | null;
      active: boolean | null;
    }>();

    // Samakan shape dengan FE (active => "YES"/"NO", phase "1 PHASE" -> "1-phase")
    return rows.map((r) => ({
      id: r.id,
      serial_number: r.serial_number ?? '',
      username: r.username ?? '',
      wattage: r.wattage ?? '',
      phase: (r.phase ?? '').replace(/\s*PHASE\s*/i, '-phase'),
      address_name: r.address_name,
      detail_address_name: r.detail_address_name,
      long: r.long,
      lat: r.lat,
      segment: r.segment,
      active: toYesNo(r.active),
    }));
  }

  async create(dto: CreateDeviceDto, caller?: Caller): Promise<DeviceListItemDto> {
    // 1) owner (username) harus ada
    const owner = await this.userRepo
      .createQueryBuilder('u')
      .where('LOWER(u.username) = LOWER(:username)', { username: dto.username.trim() })
      .getOne();

    if (!owner)
      throw new BadRequestException({
        code: 'OWNER_NOT_FOUND',
        message: 'Owner username not found',
      });

    // 2) serial unik (case-insensitive)
    const snExists = await this.giRepo
      .createQueryBuilder('gi')
      .where('LOWER(gi.serial_number) = LOWER(:sn)', { sn: dto.serial_number.trim() })
      .getExists();

    if (snExists) {
      throw new ConflictException({ code: 'SERIAL_EXISTS', message: 'Serial number already used' });
    }

    // 3) pasangan lat/long unik (persis)
    const coordExists = await this.addrRepo
      .createQueryBuilder('a')
      .where('a.latitude = :lat AND a.longitude = :long', { lat: dto.lat, long: dto.long })
      .getExists();

    if (coordExists) {
      throw new ConflictException({
        code: 'COORD_EXISTS',
        message: 'Latitude & Longitude already used',
      });
    }

    // 4) create Address → Location → GeneralInfo
    const addr = this.addrRepo.create({
      address_name: dto.address_name,
      detail_address_name: dto.detail_address_name ?? null,
      latitude: dto.lat,
      longitude: dto.long,
    });
    await this.addrRepo.save(addr);

    const loc = this.locRepo.create({
      segment: dto.segment,
      address: addr,
    });
    await this.locRepo.save(loc);

    const gi = this.giRepo.create({
      serial_number: dto.serial_number.trim(),
      wattage: dto.wattage,
      device_name: 'Power Monitoring System',
      isActive: true,
      user: owner,
      location: loc,
    });
    await this.giRepo.save(gi);

    const out = new DeviceListItemDto({
      id: String(gi.device_id), // DTO kamu `id: string`
      serial_number: gi.serial_number,
      username: owner.username,
      wattage: gi.wattage ?? undefined,
      phase: gi.phase ?? '1-phase',
      address_name: addr.address_name ?? null,
      detail_address_name: addr.detail_address_name ?? null,
      long: addr.longitude ?? null,
      lat: addr.latitude ?? null,
      segment: loc.segment ?? null,
      active: 'YES',
    });

    return out;
  }

  async update(id: number, dto: UpdateDeviceDto): Promise<DeviceListItemDto> {
    const gi = await this.giRepo.findOne({
      where: { device_id: id },
      relations: ['user', 'location', 'location.address'],
    });
    if (!gi) throw new NotFoundException({ code: 'NOT_FOUND' });

    const addr = gi.location?.address;
    if (!addr) throw new NotFoundException({ code: 'ADDR_NOT_FOUND' });

    // Cek unik lat+long (kecuali address yang sama)
    const dup = await this.addrRepo
      .createQueryBuilder('a')
      .where('a.latitude = :lat AND a.longitude = :long AND a.address_id <> :aid', {
        lat: dto.lat,
        long: dto.long,
        aid: addr.address_id,
      })
      .getExists();
    if (dup)
      throw new ConflictException({
        code: 'COORD_EXISTS',
        message: 'Latitude & Longitude already used',
      });

    // Apply perubahan (wattage/phase TIDAK disentuh)
    addr.address_name = dto.address_name;
    addr.detail_address_name = dto.detail_address_name ?? null;
    addr.latitude = dto.lat;
    addr.longitude = dto.long;
    gi.location.segment = dto.segment;

    await this.addrRepo.save(addr);
    await this.locRepo.save(gi.location);
    await this.giRepo.save(gi);

    return new DeviceListItemDto({
      id: String(gi.device_id),
      serial_number: gi.serial_number,
      username: gi.user.username,
      wattage: gi.wattage ?? undefined,
      address_name: addr.address_name,
      detail_address_name: addr.detail_address_name,
      long: addr.longitude,
      lat: addr.latitude,
      segment: gi.location.segment,
      active: gi.isActive ? 'YES' : 'NO',
    });
  }

  async remove(id: number): Promise<void> {
    const gi = await this.giRepo.findOne({
      where: { device_id: id },
      relations: ['location', 'location.address'],
    });
    if (!gi) throw new NotFoundException({ code: 'NOT_FOUND' });

    const loc = gi.location;
    const addr = loc?.address;

    await this.giRepo.delete(id);

    if (addr?.address_id) {
      const used = await this.locRepo
        .createQueryBuilder('l')
        .where('l.address_id = :aid', { aid: addr.address_id })
        .getCount();

      if (used === 0) {
        await this.addrRepo.delete(addr.address_id);
      }
    }
  }
}
