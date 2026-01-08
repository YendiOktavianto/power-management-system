import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
  BadRequestException,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { Throttle } from '@nestjs/throttler';
import { ForgotRequestDto } from './dto/forgot-request.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetService } from './password-reset/password-reset.service';
import { TokensService } from './tokens/tokens.service';
import { UsersService } from '../users/users.service';
import {
  AT_COOKIE_USER,
  RT_COOKIE_USER,
  AT_COOKIE_ADMIN,
  RT_COOKIE_ADMIN,
  cookieOptUser,
  cookieOptAdmin,
} from '../../common/constants/cookies';
import { randomUUID } from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly passwordReset: PasswordResetService,
    private readonly tokens: TokensService,
    private readonly users: UsersService,
    private readonly cfg: ConfigService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    console.log('RAW BODY =', req.body);
    console.log('DTO =', dto);
    return this.auth.register(dto);
  }

  @Post('login')
  @Throttle({ login: { limit: 5, ttl: 60_000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, access_token, refresh_token, access_ttl_ms, refresh_ttl_ms } =
      await this.auth.login(dto);

    const isAdmin = String(user.role).toUpperCase() === 'ADMIN';
    const AT = isAdmin ? AT_COOKIE_ADMIN : AT_COOKIE_USER;
    const RT = isAdmin ? RT_COOKIE_ADMIN : RT_COOKIE_USER;
    const OPT = isAdmin ? cookieOptAdmin : cookieOptUser;

    res.cookie(AT, access_token, {
      ...OPT,
      maxAge: access_ttl_ms,
    });
    res.cookie(RT, refresh_token, {
      ...OPT,
      maxAge: refresh_ttl_ms,
    });

    return {
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: String(user.role).toUpperCase(), // 'ADMIN' | 'USER'
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: { userId: number; email: string; role: string } }) {
    const { userId, email, role } = req.user;
    return { userId, email, role };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookiesMaybe = (req as Request & { cookies?: unknown }).cookies;
    if (typeof cookiesMaybe !== 'object' || cookiesMaybe === null) {
      throw new BadRequestException('Refresh token is required');
    }
    const cookies = cookiesMaybe as Record<string, unknown>;
    const rawTokenUnknown = cookies[RT_COOKIE_ADMIN] ?? cookies[RT_COOKIE_USER];
    const rawToken = typeof rawTokenUnknown === 'string' ? rawTokenUnknown : null;
    if (!rawToken) throw new BadRequestException('Refresh token is required');

    const session = await this.tokens.findActiveByRaw(rawToken);
    if (!session) throw new UnauthorizedException('Invalid or expired refresh token');

    const userId = session.userId;
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const ttlStr = this.auth.refreshTtl(false) as StringValue;
    const ttlVal = ms(ttlStr);
    if (typeof ttlVal !== 'number') throw new Error(`Invalid TTL: ${ttlStr}`);

    const newJti = randomUUID();
    const newRaw = randomUUID();
    const newExp = new Date(Date.now() + ttlVal);

    await this.tokens.rotate(session.jti, newJti, newRaw, newExp);

    const isAdmin = String(user.role).toUpperCase() === 'ADMIN';
    const AT = isAdmin ? AT_COOKIE_ADMIN : AT_COOKIE_USER;
    const RT = isAdmin ? RT_COOKIE_ADMIN : RT_COOKIE_USER;
    const OPT = isAdmin ? cookieOptAdmin : cookieOptUser;

    res.cookie(RT, newRaw, { ...OPT, maxAge: ttlVal });

    const accessTtlStr = (this.cfg.get<string>('JWT_ACCESS_EXPIRES') ?? '15m') as StringValue;
    const accessTtlMs = ms(accessTtlStr);
    if (typeof accessTtlMs !== 'number') {
      throw new Error(`Invalid access TTL: ${accessTtlStr}`);
    }

    const access_token = await this.auth.signAccess(user.userId, user.email);
    res.cookie(AT, access_token, { ...OPT, maxAge: accessTtlMs });

    return { ok: true };
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 10 * 60_000 } }) // 3x / 10 menit / IP
  @HttpCode(200)
  async forgot(@Body() dto: ForgotRequestDto, @Req() req: Request) {
    const ua = req.headers['user-agent'] ?? '';
    await this.passwordReset.requestCode(dto.email, req.ip, ua);
    return { ok: true as const };
  }

  @Post('verify-reset-code') // opsional jika UI butuh langkah ini
  @Throttle({ default: { limit: 10, ttl: 10 * 60_000 } })
  @HttpCode(200)
  async verify(@Body() dto: VerifyResetCodeDto) {
    const { ok }: { ok: boolean } = await this.passwordReset.verifyCode(dto.email, dto.code);

    if (!ok) {
      await this.passwordReset.bumpAttempt(dto.email, dto.code);
    }
    return { ok };
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 10 * 60_000 } })
  @HttpCode(200)
  async reset(@Body() dto: ResetPasswordDto) {
    try {
      await this.passwordReset.resetPassword(dto.email, dto.code, dto.newPassword);
      return { ok: true as const };
    } catch (e) {
      await this.passwordReset.bumpAttempt(dto.email, dto.code);
      throw e;
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const scope = (req.query.scope as 'admin' | 'user' | 'all') ?? 'all';

    const get = (name: string): string | null => {
      // ⬇️ Akses cookies TANPA any
      const cookiesUnknown: unknown = (req as Request & { cookies?: unknown }).cookies;

      if (typeof cookiesUnknown !== 'object' || cookiesUnknown === null) {
        return null;
      }

      const cookies = cookiesUnknown as Record<string, unknown>;
      const val = cookies[name];
      return typeof val === 'string' && val.length > 0 ? val : null;
    };

    const clearOpts = cookieOptUser;

    if (scope === 'admin' || scope === 'all') {
      const rtAdmin = get(RT_COOKIE_ADMIN);
      if (rtAdmin) await this.tokens.revokeByRaw(rtAdmin);
      res.clearCookie(AT_COOKIE_ADMIN, clearOpts);
      res.clearCookie(RT_COOKIE_ADMIN, clearOpts);
    }

    if (scope === 'user' || scope === 'all') {
      const rtUser = get(RT_COOKIE_USER);
      if (rtUser) await this.tokens.revokeByRaw(rtUser);
      res.clearCookie(AT_COOKIE_USER, clearOpts);
      res.clearCookie(RT_COOKIE_USER, clearOpts);
    }

    return { ok: true };
  }
}
