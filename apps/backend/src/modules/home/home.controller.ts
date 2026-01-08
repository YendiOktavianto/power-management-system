import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LocationService } from '../shared/location.service';
import { HomeService } from './home.service';
import { HomeQueryDto } from './dto/home-query.dto';
import type { JwtPayload } from '../auth/auth.types';

@UseGuards(JwtAuthGuard)
@Controller('home')
export class HomeController {
  constructor(
    private readonly homeSvc: HomeService,
    private readonly locationSvc: LocationService,
  ) {}

  @Get('locations')
  locations(@CurrentUser() user: JwtPayload) {
    return this.locationSvc.listUserLocations(user.sub, user.email);
  }

  @Get()
  async snapshot(@CurrentUser() user: JwtPayload, @Query() q: HomeQueryDto) {
    const deviceId = Number(q.deviceId);
    await this.locationSvc.guardDeviceOwnership(user.sub, user.email, deviceId);
    return this.homeSvc.getHomeSnapshot(deviceId);
  }
}
