import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './auth.types';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import ms, { StringValue } from 'ms';
import { TokensService } from './tokens/tokens.service';

type TokenPair = { access_token: string; refresh_token: string };
type TokenPairWithTtl = TokenPair & { access_ttl_ms: number; refresh_ttl_ms: number };
type UserOut = { userId: string; email: string; username?: string; role?: string };

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private cfg: ConfigService,
    private readonly tokens: TokensService,
  ) {}

  public signAccess(sub: string, email: string) {
    return this.jwt.signAsync(
      { sub, email },
      {
        secret: this.cfg.get<string>('JWT_ACCESS_SECRET') ?? '',
        expiresIn: (this.cfg.get<string>('JWT_ACCESS_EXPIRES', '15m') ?? '15m') as StringValue,
      },
    );
  }

  public refreshTtl(remember?: boolean): StringValue {
    const pick = (key: string, fallback: StringValue): StringValue => {
      const v: unknown = this.cfg.get(key);
      return typeof v === 'string' && v.trim().length > 0 ? (v as StringValue) : fallback;
    };

    const base = pick('JWT_REFRESH_EXPIRES', '7d');
    if (remember) {
      return pick('JWT_REFRESH_EXPIRES_REMEMBER', '30d');
    }
    return base;
  }

  public signRefresh(sub: string, email: string, opts: { ttl: StringValue; jti: string }) {
    return this.jwt.signAsync(
      { sub, email, typ: 'refresh', jti: opts.jti },
      {
        secret: this.cfg.get<string>('JWT_REFRESH_SECRET') ?? '',
        expiresIn: opts.ttl,
      },
    );
  }

  async register(dto: RegisterDto) {
    const user = await this.users.createUser({
      email: dto.email,
      username: dto.username,
      phone_number: dto.phone_number,
      password: dto.password,
    });

    const ttl = this.refreshTtl(false);
    const jti = randomUUID();

    const [access_token, refresh_token] = await Promise.all([
      this.signAccess(user.userId, user.email),
      this.signRefresh(user.userId, user.email, { ttl, jti }),
    ]);
    return {
      user: { userId: user.userId, email: user.email, username: user.username },
      access_token,
      refresh_token,
    };
  }

  async login(dto: LoginDto): Promise<{ user: UserOut } & TokenPairWithTtl> {
    const identifier = dto.identifier?.trim() ?? '';
    const password = dto.password ?? '';
    const remember = !!dto.rememberMe;

    const user = await this.users.findByEmailOrUsername(identifier);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        errors: {
          identifier: 'Incorrect Email or Username',
        },
      });
    }

    const ok = await argon2.verify(user.password_hash, password);
    if (!ok) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        errors: { password: 'Incorrect Password' },
      });
    }

    // const ttl = this.refreshTtl(remember);
    const jti = randomUUID();

    const accessTtlStr = (this.cfg.get<string>('JWT_ACCESS_EXPIRES', '15m') ??
      '15m') as StringValue;
    const accessTtlMs = ms(accessTtlStr);
    if (typeof accessTtlMs !== 'number') throw new Error(`Invalid access TTL: ${accessTtlStr}`);

    const refreshTtlStr = this.refreshTtl(remember) as StringValue;
    const refreshTtlMs = ms(refreshTtlStr);
    if (typeof refreshTtlMs !== 'number') throw new Error(`Invalid refresh TTL: ${refreshTtlStr}`);

    const access_token = await this.signAccess(user.userId, user.email);

    const refresh_token = randomUUID();

    await this.tokens.createSession({
      jti,
      userId: user.userId,
      raw: refresh_token,
      exp: new Date(Date.now() + refreshTtlMs),
      ua: null,
      ip: null,
    });

    return {
      user: {
        userId: user.userId,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      access_token,
      refresh_token,
      access_ttl_ms: accessTtlMs,
      refresh_ttl_ms: refreshTtlMs,
    };
  }

  async me(user: JwtPayload) {
    const u = await this.users.findById(user.sub);
    if (!u) {
      throw new UnauthorizedException('User not found');
    }
    return {
      userId: u.userId,
      email: u.email,
      username: u.username,
      phone_number: u.phone_number,
      role: u.role,
    };
  }

  async refresh(token: string): Promise<TokenPairWithTtl> {
    const payload = await this.jwt.verifyAsync<{
      sub: string;
      email: string;
      typ?: string;
      jti: string;
    }>(token, { secret: this.cfg.get<string>('JWT_REFRESH_SECRET') });

    if (payload?.typ !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const suspected = await this.tokens.isReuseSuspected(payload.jti, token);
    if (suspected) {
      await this.tokens.revokeAllByUser(payload.sub);
      throw new UnauthorizedException('refresh token reuse detected');
    }

    const accessTtlStr = (this.cfg.get<string>('JWT_ACCESS_EXPIRES', '15m') ??
      '15m') as StringValue;
    const accessTtlMs = ms(accessTtlStr);
    if (typeof accessTtlMs !== 'number') throw new Error(`Invalid access TTL: ${accessTtlStr}`);

    const ttl = this.refreshTtl(false) as StringValue;
    const newJti = randomUUID();
    const refresh_token = await this.signRefresh(payload.sub, payload.email, { ttl, jti: newJti });

    const ttlVal = ms(ttl);
    if (typeof ttlVal !== 'number') {
      throw new Error(`Invalid refresh TTL: ${ttl}`);
    }

    await this.tokens.rotate(payload.jti, newJti, refresh_token, new Date(Date.now() + ttlVal));

    const access_token = await this.signAccess(payload.sub, payload.email);

    return { access_token, refresh_token, access_ttl_ms: accessTtlMs, refresh_ttl_ms: ttlVal };
  }

  async logout(rawRefreshToken: string) {
    if (!rawRefreshToken) return;

    await this.tokens.revokeByRaw(rawRefreshToken);
  }
}
