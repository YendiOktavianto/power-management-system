import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { LocationModule } from './modules/dashboard/locations/location.module';

import { DeviceRequestModule } from './modules/device-request/device-request.module';
import { UserInfoModule } from './modules/user-info/user-info.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ContentModule } from './content/content.module';
import { UploadModule } from './upload/upload.module';
import { DevicesModule } from './modules/devices/device.module';
import { MonitoringInfoModule } from './modules/monitoring-info/monitoring-info.module';
import { ReportsModule } from './modules/reports/reports.module';
import { HomeModule } from './modules/home/home.module';
import { GeneralInfoModule } from './modules/general-info/general-info.module';
import { UserManagementModule } from './modules/user-management/user-management.module';
import { CostsModule } from './modules/costs/costs.module';

const uploadDir = process.env.UPLOAD_DIR || 'uploads';

@Module({
  imports: [
    // load .env sekali untuk seluruh app
    ConfigModule.forRoot({ isGlobal: true }),

    // module DB milikmu (tetap dipakai)
    DatabaseModule,

    // fitur
    UsersModule,
    AuthModule,
    ThrottlerModule.forRoot([{ ttl: 60, limit: 5 }]),
    LocationModule,
    DeviceRequestModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), uploadDir),
      serveRoot: '/uploads',
    }),
    ContentModule,
    UploadModule,
    UserInfoModule,
    DevicesModule,
    MonitoringInfoModule,
    ReportsModule,
    HomeModule,
    GeneralInfoModule,
    UserManagementModule,
    CostsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Validation global untuk semua DTO
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
