import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringInfo } from '../../database/entities/monitoring-info.entity';
import { MonitoringInfoService } from './monitoring-info.service';
import { MonitoringInfoController } from './monitoring-info.controller';
import { GeneralInfo } from '../../database/entities/general-info.entity';
import { Address } from '../../database/entities/address.entity';
import { Location } from '../../database/entities/location.entity';
import { Cost } from '../../database/entities/cost.entity';
import { CostHistory } from '../../database/entities/cost-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MonitoringInfo, GeneralInfo, Location, Address, Cost, CostHistory]),
  ],
  controllers: [MonitoringInfoController],
  providers: [MonitoringInfoService],
  exports: [MonitoringInfoService],
})
export class MonitoringInfoModule {}
