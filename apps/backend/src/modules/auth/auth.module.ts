import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../../database/entities/user.entity';
import { Organization } from '../../database/entities/organization.entity';
import { OrganizationMember } from '../../database/entities/organization-member.entity';
import { AccountInvite } from '../../database/entities/account-invite.entity';
import { AuditLog } from '../../database/entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization, OrganizationMember, AccountInvite, AuditLog]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
