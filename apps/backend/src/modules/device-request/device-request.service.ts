import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeviceRequest } from '../../database/entities/device-request.entity';
import { GeneralInfo, PhaseType } from '../../database/entities/general-info.entity';
import { Location } from '../../database/entities/location.entity';
import { Address } from '../../database/entities/address.entity';
import { User } from '../../database/entities/user.entity';
import { CreateDeviceRequestDto } from './dto/create-device-request.dto';
import { UpdateDeviceRequestDto } from './dto/update-device-request.dto';
import { nextSerialNumber } from '../../utils/serial';

@Injectable()
export class DeviceRequestService {
  constructor(
    @InjectRepository(DeviceRequest)
    private readonly reqRepo: Repository<DeviceRequest>,
    @InjectRepository(GeneralInfo) private readonly giRepo: Repository<GeneralInfo>,
    @InjectRepository(Location) private readonly locRepo: Repository<Location>,
    @InjectRepository(Address) private readonly addrRepo: Repository<Address>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  findAll() {
    return this.reqRepo.find({ order: { time: 'DESC' } });
  }

  async findByUsername(username: string) {
    return this.reqRepo.find({
      where: { username },
      order: { time: 'DESC' },
    });
  }

  async create(dto: CreateDeviceRequestDto, user: { username: string }) {
    const entity = this.reqRepo.create({
      ...dto,
      username: user.username,
      status: 'pending',
      time: String(Date.now()),
    });
    return this.reqRepo.save(entity);
  }

  async update(dto: UpdateDeviceRequestDto) {
    const found = await this.reqRepo.findOne({ where: { id: dto.id } });
    if (!found) throw new NotFoundException('Request not found');
    const prev = found.status;
    found.status = dto.status;

    if (prev !== 'approved' && dto.status === 'approved') {
      const provisioned = await this.approveProvision(found, {
        wattage: dto.wattage, // string "2000 VA", dll
      });
      return { ...found, provisioned };
    }

    return this.reqRepo.save(found);
  }

  private async approveProvision(req: DeviceRequest, opts?: { wattage?: string }) {
    const user = await this.userRepo.findOne({
      where: { username: req.username },
      select: ['userId', 'username'],
    });
    if (!user) throw new BadRequestException('User not found for request.username');

    const norm = (s?: string | null) => (s ?? '').trim().replace(/\s+/g, ' ');

    return this.dataSource.transaction(async (m) => {
      const serial = await nextSerialNumber(m);
      const gi = m.create(GeneralInfo, {
        isActive: true,
        serial_number: serial,
        device_name: 'Power Monitoring System',
        wattage: opts?.wattage ?? '2000 VA',
        phase: PhaseType.ONE_PHASE,
      });
      gi.user = m.create(User, { userId: user.userId } as any);
      const savedGI = await m.save(gi);

      const lat: number = req.lat;
      const lng: number = req.lng;

      const addrRepo = m.getRepository(Address);

      let savedAddr = await addrRepo.findOne({
        where: { latitude: lat, longitude: lng },
      });

      if (!savedAddr) {
        savedAddr = await addrRepo.save(
          addrRepo.create({
            address_name: norm(req.address),
            detail_address_name: norm(req.detail_address) || null,
            latitude: lat,
            longitude: lng,
          }),
        );
      }

      const savedLoc = await m.save(
        m.create(Location, {
          segment: req.segmen ?? undefined,
          device: { device_id: savedGI.device_id },
          address: { address_id: savedAddr.address_id },
        }),
      );

      await m.getRepository(DeviceRequest).update({ id: Number(req.id) }, { status: 'approved' });

      return {
        general_info: savedGI,
        address: savedAddr,
        location: savedLoc,
      };
    });
  }

  async remove(id: number) {
    const res = await this.reqRepo.delete(id);
    if (!res.affected) throw new NotFoundException('Request not found');
    return { success: true };
  }
}
