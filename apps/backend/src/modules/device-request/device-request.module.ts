import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralInfo } from '../../database/entities/general-info.entity';
import { Location } from '../../database/entities/location.entity';
import { Address } from '../../database/entities/address.entity';
import { User } from '../../database/entities/user.entity';
import { DeviceRequest } from '../../database/entities/device-request.entity';
import { DeviceRequestService } from './device-request.service';
import { DeviceRequestController } from './device-request.controller';
import { UsersService } from '../users/users.service';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeviceRequest,
      GeneralInfo, // ⬅️ WAJIB ada
      Location,
      Address,
      User,
    ]),
  ],
  controllers: [DeviceRequestController],
  providers: [DeviceRequestService, UsersService, RolesGuard],
})
export class DeviceRequestModule {}
