import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard) // kalau mau ketat, tambahkan RolesGuard + @Roles('ADMIN')
export class ReportsAdminController {
  constructor(private readonly svc: ReportsService) {}

  @Get('summary')
  summary(@Query() q: ReportQueryDto) {
    return this.svc.summaryReportAdmin(q);
  }

  @Get('energy')
  energy(@Query() q: ReportQueryDto) {
    return this.svc.energyReportAdmin(q);
  }
}
