import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // load .env sekali untuk seluruh app
    ConfigModule.forRoot({ isGlobal: true }),

    // module DB milikmu (tetap dipakai)
    DatabaseModule,

    // auth/provisioning module
    AuthModule,
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
