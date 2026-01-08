import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.types';
import { HomeService } from './home.service';
import { LocationService } from '../shared/location.service';
import { HomeQueryDto } from './dto/home-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../database/entities/user.entity';

type JwtUser = { userId: number; role?: string };

@UseGuards(JwtAuthGuard)
@Controller('admin') // base route: /admin
export class AdminController {
  constructor(
    private readonly homeSvc: HomeService,
    private readonly locationSvc: LocationService,
  ) {}

  @Get('locations')
  async locations() {
    return this.locationSvc.listAllLocations();
  }

  @Get()
  async snapshot(@Query() q: HomeQueryDto) {
    if (!q.deviceId) throw new BadRequestException('deviceId is required');
    return this.homeSvc.getHomeSnapshot(Number(q.deviceId));
  }
}
