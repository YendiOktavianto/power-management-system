import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralInfo } from '../../database/entities/general-info.entity';
import { Address } from '../../database/entities/address.entity';
import { GeneralInfoController } from './general-info.controller';
import { GeneralInfoService } from './general-info.service';
import { LocationService } from '../shared/location.service';
import { MonitoringInfo } from '../../database/entities/monitoring-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GeneralInfo, Address, MonitoringInfo])],
  controllers: [GeneralInfoController],
  providers: [GeneralInfoService, LocationService],
})
export class GeneralInfoModule {}
