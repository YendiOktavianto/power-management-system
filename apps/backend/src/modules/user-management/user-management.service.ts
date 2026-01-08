import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../../database/entities/user.entity';
import { GeneralInfo } from '../../database/entities/general-info.entity';

import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { ListUsersQueryDto } from './dto/list-users.query.dto';

export interface UserTableRow {
  serial: number;
  id: string;
  username: string;
  email: string;
  numberPhone: string | null;
  role: UserRole;
  totalDevices: number;
  createdAt: string;
}

export interface Paged<T> {
  page: number;
  pageSize: number;
  total: number;
  rows: T[];
}

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(GeneralInfo) private readonly giRepo: Repository<GeneralInfo>,
  ) {}

  async createByAdmin(dto: CreateUserByAdminDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password konfirmasi tidak sama.');
    }

    // unik username/email
    const exists = await this.userRepo.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });
    if (exists) throw new BadRequestException('Username atau email sudah terpakai.');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      username: dto.username,
      email: dto.email,
      phone_number: dto.phone_number,
      password_hash: passwordHash,
      role: dto.role,
    });

    await this.userRepo.save(user);

    return {
      id: user.userId,
      username: user.username,
      email: user.email,
      numberPhone: user.phone_number ?? null,
      role: user.role,
      createdAt: user.created_at,
    };
  }

  async listUsersForTable(q: ListUsersQueryDto): Promise<Paged<UserTableRow>> {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    // waktu
    let fromAt: Date | undefined;
    let toAt: Date | undefined;
    if (q.from && q.to) {
      const tf = q.timeFrom ?? '00:00:00';
      const tt = q.timeTo ?? '23:59:59';
      fromAt = new Date(`${q.from}T${tf}`);
      toAt = new Date(`${q.to}T${tt}`);
    }

    const countQb = this.userRepo
      .createQueryBuilder('u')
      .where('u.role = :roleUser', { roleUser: UserRole.USER });

    if (q.q) {
      countQb.andWhere(
        new Brackets((qb) => {
          qb.where('u.username ILIKE :kw', { kw: `%${q.q}%` })
            .orWhere('u.email ILIKE :kw', { kw: `%${q.q}%` })
            .orWhere('u.phone_number ILIKE :kw', { kw: `%${q.q}%` });
        }),
      );
    }
    if (fromAt && toAt) {
      countQb.andWhere('u.created_at BETWEEN :from AND :to', { from: fromAt, to: toAt });
    }

    const rawCount = await countQb
      .select('COUNT(DISTINCT u."userId")', 'count')
      .getRawOne<{ count: string | number }>();

    const total = Number(rawCount?.count ?? 0);

    // DATA
    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoin(GeneralInfo, 'gi', 'gi.user_id = u."userId"')
      .where('u.role = :roleUser', { roleUser: UserRole.USER });

    if (q.q) {
      qb.andWhere(
        new Brackets((qb2) => {
          qb2
            .where('u.username ILIKE :kw', { kw: `%${q.q}%` })
            .orWhere('u.email ILIKE :kw', { kw: `%${q.q}%` })
            .orWhere('u.phone_number ILIKE :kw', { kw: `%${q.q}%` });
        }),
      );
    }
    if (fromAt && toAt) {
      qb.andWhere('u.created_at BETWEEN :from AND :to', { from: fromAt, to: toAt });
    }

    qb.select([
      'u."userId" AS "userId"',
      'u.username AS "username"',
      'u.email AS "email"',
      'u.phone_number AS "phone_number"',
      'u.role AS "role"',
      'u.created_at AS "created_at"',
      'COUNT(DISTINCT gi.device_id) AS "totalDevices"',
    ])
      .groupBy('u."userId"')
      .addGroupBy('u.username')
      .addGroupBy('u.email')
      .addGroupBy('u.phone_number')
      .addGroupBy('u.role')
      .addGroupBy('u.created_at')
      .orderBy('u.created_at', 'ASC')
      .offset(offset)
      .limit(pageSize);

    type RawRow = {
      userId: string;
      username: string;
      email: string;
      phone_number: string | null;
      role: UserRole;
      created_at: Date;
      totalDevices: string | number;
    };

    const rows = await qb.getRawMany<RawRow>();

    const mapped: UserTableRow[] = rows.map((r, i) => ({
      serial: offset + i + 1,
      id: r.userId,
      username: r.username,
      email: r.email,
      numberPhone: r.phone_number ?? null,
      role: r.role,
      totalDevices: Number(r.totalDevices) || 0,
      createdAt: new Date(r.created_at).toISOString(),
    }));

    return { page, pageSize, total, rows: mapped };
  }

  async updateUserByAdmin(id: string, dto: UpdateUserByAdminDto) {
    const user = await this.userRepo.findOne({ where: { userId: id } });
    if (!user) throw new NotFoundException('User tidak ditemukan.');
    if (user.role !== UserRole.USER) {
      throw new BadRequestException('Akun admin tidak dapat diedit di menu ini.');
    }

    if (dto.email && dto.email !== user.email) {
      const existEmail = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existEmail) throw new BadRequestException('Email sudah terpakai.');
    }
    if (dto.username && dto.username !== user.username) {
      const existUsername = await this.userRepo.findOne({ where: { username: dto.username } });
      if (existUsername) throw new BadRequestException('Username sudah terpakai.');
    }

    await this.userRepo.update(
      { userId: id },
      {
        username: dto.username ?? user.username,
        email: dto.email ?? user.email,
        phone_number: dto.phone_number ?? user.phone_number,
      },
    );

    const updated = await this.userRepo.findOne({ where: { userId: id } });
    return {
      id: updated!.userId,
      username: updated!.username,
      email: updated!.email,
      numberPhone: updated!.phone_number ?? null,
      role: updated!.role,
      createdAt: user.created_at,
    };
  }

  async deleteUserByAdmin(id: string) {
    const user = await this.userRepo.findOne({ where: { userId: id } });
    if (!user) throw new NotFoundException('User tidak ditemukan.');
    if (user.role !== UserRole.USER) {
      throw new BadRequestException('Akun admin tidak dapat dihapus di menu ini.');
    }
    await this.userRepo.delete({ userId: id });
    return { success: true };
  }
}
