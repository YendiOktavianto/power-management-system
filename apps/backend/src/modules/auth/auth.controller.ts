import { BadRequestException, Body, Controller, Headers, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { CreatePrincipalDto } from './dto/create-principal.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';

type ActorContext = {
  userId: string;
  orgId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

@Controller('provisioning')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('principals')
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

  @Post('companies')
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

  @Post('customers')
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

  private buildActorContext(
    actorUserId: string | undefined,
    actorOrgId: string | undefined,
    req: Request,
  ): ActorContext {
    if (!actorUserId) {
      throw new BadRequestException('Missing x-actor-user-id header.');
    }
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip =
      (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)?.split(',')[0]?.trim() ||
      req.ip ||
      null;
    return {
      userId: actorUserId,
      orgId: actorOrgId ?? null,
      ip,
      userAgent: req.headers['user-agent'] ?? null,
    };
  }
}
