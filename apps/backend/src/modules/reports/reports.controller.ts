import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get('summary')
  async getSummary(@CurrentUser() me: { userId: number }, @Query() q: ReportQueryDto) {
    // kirim userId ke service
    return this.svc.summaryReport({ ...q, userId: me.userId });
  }

  @Get('energy')
  async getEnergy(@CurrentUser() me: { userId: number }, @Query() q: ReportQueryDto) {
    return this.svc.energyReport({ ...q, userId: me.userId });
  }
}
