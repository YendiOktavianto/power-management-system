import { Request } from 'express';

export type AppRole = 'ADMIN' | 'USER';

export interface JwtUser {
  id: string;
  email: string;
  role: AppRole;
}

export type AuthenticatedRequest = Request & { user?: JwtUser };
