import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from '../../../database/entities/location.entity';
import { MonitoringInfo } from '../../../database/entities/monitoring-info.entity';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Location, MonitoringInfo])],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
