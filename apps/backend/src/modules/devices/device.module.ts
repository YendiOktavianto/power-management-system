import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesController } from './device.controller';
import { DevicesService } from './device.service';

import { GeneralInfo } from '../../database/entities/general-info.entity';
import { Location } from '../../database/entities/location.entity';
import { Address } from '../../database/entities/address.entity';
import { User } from '../../database/entities/user.entity';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([GeneralInfo, Location, Address, User])],
  controllers: [DevicesController],
  providers: [DevicesService, RolesGuard],
})
export class DevicesModule {}
