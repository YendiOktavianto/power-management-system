import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { DeviceRequestService } from './device-request.service';
import { CreateDeviceRequestDto } from './dto/create-device-request.dto';
import { UpdateDeviceRequestDto } from './dto/update-device-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../database/entities/user.entity';

@Controller('device-request')
export class DeviceRequestController {
  constructor(
    private readonly service: DeviceRequestService,
    private readonly users: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: Request) {
    const cu = req.user as unknown as { email: string };
    const u = await this.users.findByEmailOrUsername(cu.email);
    if (!u) throw new UnauthorizedException('User not found');

    // ADMIN boleh lihat semua
    if (u.role === UserRole.ADMIN) {
      return this.service.findAll();
    }

    // USER biasa hanya lihat history miliknya sendiri
    return this.service.findByUsername(u.username);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateDeviceRequestDto, @Req() req: Request) {
    const cu = req.user as unknown as { userId: string; email: string };
    const u = await this.users.findByEmailOrUsername(cu.email);
    if (!u) throw new UnauthorizedException('User not found');
    return this.service.create(dto, { username: u.username });
  }

  @Patch()
  update(@Body() dto: UpdateDeviceRequestDto) {
    return this.service.update(dto);
  }

  @Delete()
  deleteBody(@Body() dto: { id: number }) {
    return this.service.remove(dto.id);
  }

  @Delete(':id')
  deleteParam(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
