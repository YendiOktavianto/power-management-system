import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { MonitoringInfo } from '../../database/entities/monitoring-info.entity';
import { ReportsAdminController } from './reports.admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MonitoringInfo])],
  controllers: [ReportsController, ReportsAdminController],
  providers: [ReportsService],
})
export class ReportsModule {}
