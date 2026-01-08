import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { LocationService } from '../shared/location.service';
import { Address } from '../../database/entities/address.entity';
import { GeneralInfo } from '../../database/entities/general-info.entity';
import { MonitoringInfo } from '../../database/entities/monitoring-info.entity';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Address, GeneralInfo, MonitoringInfo])],
  controllers: [HomeController, AdminController],
  providers: [HomeService, LocationService],
})
export class HomeModule {}
