import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth.types';
import { CurrentUserData } from '../../../common/types/current-user.type';
import type { Request } from 'express';
import { AT_COOKIE_USER, AT_COOKIE_ADMIN } from '../../../common/constants/cookies';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    const cookieExtractor = (req: Request): string | null => {
      const cookiesMaybe = (req as Request & { cookies?: unknown }).cookies;

      if (typeof cookiesMaybe !== 'object' || cookiesMaybe === null) return null;
      const cookies = cookiesMaybe as Record<string, unknown>;

      const userVal = cookies[AT_COOKIE_USER];
      if (typeof userVal === 'string' && userVal.length > 0) return userVal;

      const adminVal = cookies[AT_COOKIE_ADMIN];
      if (typeof adminVal === 'string' && adminVal.length > 0) return adminVal;

      return null;
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: JwtPayload): CurrentUserData {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
