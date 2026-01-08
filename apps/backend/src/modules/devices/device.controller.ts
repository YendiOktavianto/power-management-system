import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { DevicesService } from './device.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeviceListQueryDto } from './dto/device-list-query.dto';
import { DeviceListItemDto } from './dto/device-list-item.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

type ReqUser = { userId?: string; id?: string; role?: string; username?: string };
type AuthReq = Request & { user: ReqUser };

@Controller(['devices'])
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private readonly svc: DevicesService) {}

  @Get()
  async list(
    @Query(new ValidationPipe({ whitelist: true, transform: true }))
    query: DeviceListQueryDto,
  ): Promise<DeviceListItemDto[]> {
    return this.svc.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) dto: CreateDeviceDto,
    @Req() req: AuthReq,
  ): Promise<DeviceListItemDto> {
    const caller = {
      requesterId: req.user?.userId ?? req.user?.id ?? '',
      role: String(req.user?.role ?? '').toUpperCase(),
      username: req.user?.username,
    };
    return await this.svc.create(dto, caller);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, transform: true })) dto: UpdateDeviceDto,
  ): Promise<DeviceListItemDto> {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.svc.remove(id);
  }
}
