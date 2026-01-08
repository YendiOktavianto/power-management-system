import { UserRole } from '../../database/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export type JwtLike = JwtPayload &
  Partial<{ userId: string | number; id: string | number; uid: string | number }>;
