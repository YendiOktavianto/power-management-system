import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../../database/entities/user.entity';
import { Organization } from '../../database/entities/organization.entity';
import { OrganizationMember } from '../../database/entities/organization-member.entity';
import { AccountInvite } from '../../database/entities/account-invite.entity';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { RefreshSession } from '../../database/entities/refresh-sessions.entity';
import { SessionEvent } from '../../database/entities/session-event.entity';
import { LoginAttempt } from '../../database/entities/login-attempt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Organization,
      OrganizationMember,
      AccountInvite,
      AuditLog,
      RefreshSession,
      SessionEvent,
      LoginAttempt,
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret',
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES') ?? '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
