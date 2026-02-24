import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { CreatePrincipalDto } from './dto/create-principal.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';

type ActorContext = {
  userId: string;
  orgId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

type RequestContext = {
  ip?: string | null;
  userAgent?: string | null;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('provisioning/principals')
  async createPrincipal(
    @Body() dto: CreatePrincipalDto,
    @Headers('x-actor-user-id') actorUserId: string | undefined,
    @Headers('x-actor-org-id') actorOrgId: string | undefined,
    @Req() req: Request,
  ) {
    return this.authService.createPrincipal(
      dto,
      this.buildActorContext(actorUserId, actorOrgId, req),
    );
  }

  @Post('provisioning/companies')
  async createCompany(
    @Body() dto: CreateCompanyDto,
    @Headers('x-actor-user-id') actorUserId: string | undefined,
    @Headers('x-actor-org-id') actorOrgId: string | undefined,
    @Req() req: Request,
  ) {
    return this.authService.createCompany(
      dto,
      this.buildActorContext(actorUserId, actorOrgId, req),
    );
  }

  @Post('provisioning/customers')
  async createCustomer(
    @Body() dto: CreateCustomerDto,
    @Headers('x-actor-user-id') actorUserId: string | undefined,
    @Headers('x-actor-org-id') actorOrgId: string | undefined,
    @Req() req: Request,
  ) {
    return this.authService.createCustomer(
      dto,
      this.buildActorContext(actorUserId, actorOrgId, req),
    );
  }

  @Post('set-password')
  async setPassword(@Body() dto: SetPasswordDto, @Req() req: Request) {
    return this.authService.setPassword(dto, this.buildRequestContext(req));
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, this.buildRequestContext(req));
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refresh(dto, this.buildRequestContext(req));
  }

  @Post('logout')
  async logout(@Body() dto: LogoutDto, @Req() req: Request) {
    return this.authService.logout(dto, this.buildRequestContext(req));
  }

  private buildActorContext(
    actorUserId: string | undefined,
    actorOrgId: string | undefined,
    req: Request,
  ): ActorContext {
    if ((process.env.NODE_ENV ?? 'development') === 'production') {
      throw new ForbiddenException('Provisioning via x-actor-* headers is disabled in production.');
    }
    if (!actorUserId) {
      throw new BadRequestException('Missing x-actor-user-id header.');
    }
    const requestContext = this.buildRequestContext(req);
    return {
      userId: actorUserId,
      orgId: actorOrgId ?? null,
      ip: requestContext.ip,
      userAgent: requestContext.userAgent,
    };
  }

  private buildRequestContext(req: Request): RequestContext {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip =
      (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)?.split(',')[0]?.trim() ||
      req.ip ||
      null;
    return {
      ip,
      userAgent: req.headers['user-agent'] ?? null,
    };
  }
}
