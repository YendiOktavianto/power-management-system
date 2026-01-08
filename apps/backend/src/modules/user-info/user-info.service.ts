import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import argon2 from 'argon2';
import { User } from '../../database/entities/user.entity';
import { GeneralInfo } from '../../database/entities/general-info.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

@Injectable()
export class UserInfoService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(GeneralInfo) private readonly giRepo: Repository<GeneralInfo>,
  ) {}

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({
      where: { userId },
      relations: { devices: true },
    });
    if (!user) throw new NotFoundException('User not found');

    return {
      userId: user.userId,
      username: user.username,
      email: user.email,
      phoneNumber: user.phone_number,
      profileImg: user.profil_img,
      devices: (user.devices ?? []).map((d) => ({
        deviceId: d.device_id,
        deviceName: d.device_name,
        serialNumber: d.serial_number,
        isActive: d.isActive,
      })),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({ where: { userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.email) {
      const exists = await this.userRepo.findOne({ where: { email: dto.email } });
      if (exists && exists.userId !== userId) throw new BadRequestException('Email already in use');
    }
    if (dto.username) {
      const exists = await this.userRepo.findOne({ where: { username: dto.username } });
      if (exists && exists.userId !== userId)
        throw new BadRequestException('Username already in use');
    }

    if (dto.username !== undefined) user.username = dto.username;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phoneNumber !== undefined) user.phone_number = dto.phoneNumber;

    Object.assign(user, {
      username: dto.username ?? user.username,
      email: dto.email ?? user.email,
      phoneNumber: dto.phoneNumber ?? user.phone_number,
    });
    await this.userRepo.save(user);
    return { ok: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({
      where: { userId },
      select: { userId: true, password_hash: true },
    });
    if (!user) throw new NotFoundException('User not found');

    console.log('Has hash?', !!user.password_hash, 'hash length:', user.password_hash?.length);

    // verifikasi hash argon2
    const match = await argon2.verify(user.password_hash, dto.currentPassword);
    if (!match) throw new BadRequestException('Current password is incorrect');
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    const newHash = await argon2.hash(dto.newPassword);

    await this.userRepo.update({ userId }, { password_hash: newHash });
    return { ok: true };
  }

  async updatePhoto(userId: string, dto: UpdatePhotoDto) {
    const b64 = dto.base64Image ?? '';
    if (!b64.startsWith('data:image/')) {
      throw new BadRequestException(
        'Invalid image: must be data URL base64 (data:image/*;base64,...)',
      );
    }
    const estimatedBytes = Math.floor((b64.length * 3) / 4);
    if (estimatedBytes > 5 * 1024 * 1024) {
      throw new BadRequestException('Image too large (max 5MB)');
    }

    const { affected } = await this.userRepo.update({ userId }, { profil_img: b64 });
    if (!affected) throw new NotFoundException('User not found');

    return { ok: true };
  }
}
