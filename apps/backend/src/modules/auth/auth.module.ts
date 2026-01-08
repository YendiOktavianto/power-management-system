import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import type { JwtSignOptions } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TokensModule } from './tokens/tokens.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { TokensService } from './tokens/tokens.service';
import { RefreshSession } from '../../database/entities/refresh-sessions.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { StringValue } from 'ms';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TokensModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const ttl = cfg.get<string>('JWT_ACCESS_EXPIRES', '15m') as StringValue;
        return {
          secret: cfg.get<string>('JWT_ACCESS_SECRET') ?? '',
          signOptions: { expiresIn: ttl } satisfies JwtSignOptions,
        };
      },
    }),
    PasswordResetModule,
    TypeOrmModule.forFeature([RefreshSession]),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, TokensService],
  controllers: [AuthController],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
