import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { GeneralInfo } from '../../database/entities/general-info.entity';
import { UserInfoController } from './user-info.controller';
import { UserInfoService } from './user-info.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, GeneralInfo])],
  controllers: [UserInfoController],
  providers: [UserInfoService],
  exports: [],
})
export class UserInfoModule {}
