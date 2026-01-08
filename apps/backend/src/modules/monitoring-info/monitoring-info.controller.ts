import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Sse,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateMonitoringInfoDto } from './dto/create-monitoring-info.dto';
import { MonitoringInfoService } from './monitoring-info.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// Controller FINAL — disesuaikan dengan entity monitoring_info di project kamu
// Endpoint utama yang dipanggil hardware: POST /monitoring-info
// Endpoint untuk FE Power Monitoring: latest, series/day, series/range, dan SSE (opsional)

@Controller('monitoring-info')
export class MonitoringInfoController {
  constructor(private readonly svc: MonitoringInfoService) {}

  @Get('header/:deviceId')
  header(@Param('deviceId') deviceId: string) {
    return this.svc.getHeader(Number(deviceId));
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async mine(@CurrentUser() me: { userId: number }) {
    return this.svc.findMine(me.userId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  ingest(@Body() body: CreateMonitoringInfoDto) {
    return this.svc.ingest(body);
  }

  @Get('latest/:deviceId')
  latest(@Param('deviceId', ParseIntPipe) deviceId: number) {
    return this.svc.latest(deviceId);
  }

  @Get('series/day')
  seriesByDate(@Query('deviceId') deviceId: string, @Query('date') date: string) {
    return this.svc.seriesByDate(Number(deviceId), date);
  }

  @Get('series/range')
  seriesRange(
    @Query('deviceId') deviceId: string,
    @Query('from') fromISO: string,
    @Query('to') toISO: string,
  ) {
    return this.svc.seriesRange(Number(deviceId), fromISO, toISO);
  }

  // Realtime (opsional): FE bisa subscribe SSE untuk update langsung
  // @Sse('sse')
  // sse(): Observable<MessageEvent> {
  //   return this.svc.stream$.pipe(map((data) => ({ data })));
  // }
}
