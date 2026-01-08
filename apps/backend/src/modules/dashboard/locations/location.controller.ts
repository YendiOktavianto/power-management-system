import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationMarkerDto } from './dto/location-maker.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

type JwtUser = { sub?: string; userId?: string; email?: string; role?: string };

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationController {
  constructor(private readonly service: LocationService) {}

  @Get('listForMe')
  async listForMe(@CurrentUser() user: JwtUser): Promise<LocationMarkerDto[]> {
    const uid = (user?.sub ?? user?.userId)?.toString();
    if (!uid) return [];
    return this.service.findMarkersByUser(uid);
  }

  async listByUserId(@Query('userId') userId?: string): Promise<LocationMarkerDto[]> {
    if (!userId) return [];
    return this.service.findMarkersByUser(userId.toString());
  }

  @Get('listAll')
  async listAll(): Promise<LocationMarkerDto[]> {
    return this.service.findAllMarkers();
  }
}
