import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: number;
      username: string;
      role?: 'ADMIN' | 'USER';
    };
    cookies?: Record<string, string>;
  }
}
