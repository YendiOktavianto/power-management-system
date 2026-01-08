// apps/backend/src/modules/auth/mailer/mailer.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { existsSync } from 'fs';
import nodemailer from 'nodemailer';
import { AppMailerService } from './mailer.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'MAIL_TEMPLATES_DIR',
      useFactory: () => {
        // Candidate paths: dist + src (monorepo & single-app)
        const candidates = [
          join(__dirname, 'templates'), // dist
          join(process.cwd(), './templates'), // dev (apps/backend cwd)
          join(process.cwd(), 'apps/backend/src/modules/auth/mailer/templates'), // dev (project root cwd)
        ];
        return (
          candidates.find(
            (dir) =>
              existsSync(join(dir, 'reset-code.hbs')) &&
              existsSync(join(dir, 'password-changed.hbs')),
          ) ?? candidates[0]
        );
      },
    },
    {
      provide: 'MAIL_TRANSPORT',
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const host = cfg.get<string>('MAIL_HOST', 'smtp.gmail.com');
        const port = parseInt(cfg.get<string>('MAIL_PORT', '587'), 10);
        const secure = cfg.get<string>('MAIL_SECURE', 'false') === 'true';
        const user = cfg.get<string>('MAIL_USER');
        const pass = cfg.get<string>('MAIL_PASS');

        return nodemailer.createTransport({
          host,
          port,
          secure,
          auth: user && pass ? { user, pass } : undefined,
        });
      },
    },
    AppMailerService,
  ],
  exports: [AppMailerService],
})
export class AppMailerModule {}
