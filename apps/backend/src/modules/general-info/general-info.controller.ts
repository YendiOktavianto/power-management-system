// apps/backend/src/modules/general-info/general-info.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtLike, JwtPayload } from '../auth/auth.types';
import { GeneralInfoService } from './general-info.service';
import { VerifyQrDto } from './dto/verify-qr.dto';

function resolveUid(user: JwtLike): string {
  const candidate = user.sub ?? (user as any).userId ?? user.id ?? (user as any).uid ?? user.email;
  return typeof candidate === 'number' ? String(candidate) : (candidate ?? '');
}

@UseGuards(JwtAuthGuard)
@Controller('general-info')
export class GeneralInfoController {
  constructor(private readonly svc: GeneralInfoService) {}

  @Get('devices')
  listDevices(@CurrentUser() user: JwtPayload) {
    return this.svc.listDevices(resolveUid(user), user.email);
  }

  @Get('qr')
  getQr(@CurrentUser() user: JwtLike, @Query('deviceId', ParseIntPipe) deviceId: number) {
    const uid = resolveUid(user);
    if (!uid) throw new BadRequestException('Cannot resolve user id from JWT');
    return this.svc.getQrToken(uid, user.email, deviceId);
  }

  @Post('verify')
  verify(@CurrentUser() user: JwtLike, @Body() dto: VerifyQrDto) {
    const uid = resolveUid(user);
    if (!uid) throw new BadRequestException('Cannot resolve user id from JWT');
    return this.svc.verifyToken(uid, user.email, dto.deviceId, dto.token);
  }

  @Get('detail')
  detail(
    @CurrentUser() user: JwtLike,
    @Query('deviceId', ParseIntPipe) deviceId: number,
    @Query('token') token?: string,
  ) {
    const uid = resolveUid(user);
    if (!uid) throw new BadRequestException('Cannot resolve user id from JWT');
    return this.svc.getDetail(uid, user.email, deviceId, token);
  }

  // 🔹 NEW: dipakai laptop untuk cek status unlock (tanpa token)
  @Get('unlock-status')
  unlockStatus(@CurrentUser() user: JwtLike, @Query('deviceId', ParseIntPipe) deviceId: number) {
    const uid = resolveUid(user);
    if (!uid) throw new BadRequestException('Cannot resolve user id from JWT');
    return this.svc.getUnlockStatus(uid, user.email, deviceId);
  }
}
