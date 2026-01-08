import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { GeneralInfo } from '../../database/entities/general-info.entity';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, GeneralInfo])],
  controllers: [UserManagementController],
  providers: [UserManagementService],
})
export class UserManagementModule {}
