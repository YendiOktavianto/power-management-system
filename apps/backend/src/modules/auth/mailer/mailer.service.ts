// modules/auth/mailer/mailer.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Transporter } from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';

type ResetCodePayload = {
  email: string;
  code: string;
  username?: string | null;
  expiresAt: Date;
  ip?: string | null;
  ua?: string | null;
  purpose?: 'reset_password' | 'verify_email';
};

type PasswordChangedPayload = {
  email: string;
  username?: string | null;
  changedAt?: Date;
  ip?: string | null;
  ua?: string | null;
};

@Injectable()
export class AppMailerService {
  private readonly logger = new Logger(AppMailerService.name);
  private readonly appName: string;
  private readonly appUrl: string;
  private readonly from: string;
  private readonly templates = new Map<string, Handlebars.TemplateDelegate>();

  constructor(
    @Inject('MAIL_TRANSPORT') private readonly transport: Transporter,
    @Inject('MAIL_TEMPLATES_DIR') private readonly templatesDir: string,
    private readonly cfg: ConfigService,
  ) {
    this.appName = this.cfg.get<string>('APP_NAME', 'EMS');
    this.appUrl = this.cfg.get<string>('APP_URL', 'http://localhost:4000');

    const fromName = this.cfg.get<string>('MAIL_FROM_NAME', 'No-Reply');
    const fromEmail = this.cfg.get<string>('MAIL_FROM_EMAIL', 'no-reply@example.com');
    this.from = `"${fromName}" <${fromEmail}>`;
  }

  private renderTemplate(name: string, context: Record<string, unknown>): string {
    let tpl = this.templates.get(name);
    if (!tpl) {
      const filePath = join(this.templatesDir, `${name}.hbs`);
      const source = readFileSync(filePath, 'utf8');
      tpl = Handlebars.compile(source, { strict: true });
      this.templates.set(name, tpl);
    }
    return tpl(context);
  }

  async sendResetCode(payload: ResetCodePayload): Promise<void> {
    const { email, code, username, expiresAt, ip, ua, purpose = 'reset_password' } = payload;

    try {
      const html = this.renderTemplate('reset-code', {
        appName: this.appName,
        appUrl: this.appUrl,
        email,
        username: username ?? 'there',
        code,
        purpose,
        expiresAtISO: expiresAt.toISOString(),
        expiresAtHuman: expiresAt.toUTCString(),
        ip: ip ?? 'Unknown IP',
        ua: ua ?? 'Unknown Device',
      });

      await this.transport.sendMail({
        to: email,
        from: this.from,
        subject: `[${this.appName}] Your password reset code`,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send reset code to ${email}`, err as Error);
      throw new Error('MAIL_SEND_FAILED');
    }
  }

  async sendPasswordChangedNotice(payload: PasswordChangedPayload): Promise<void> {
    const { email, username, changedAt = new Date(), ip, ua } = payload;

    try {
      const html = this.renderTemplate('password-changed', {
        appName: this.appName,
        appUrl: this.appUrl,
        email,
        username: username ?? 'there',
        changedAtISO: changedAt.toISOString(),
        changedAtHuman: changedAt.toUTCString(),
        ip: ip ?? 'Unknown IP',
        ua: ua ?? 'Unknown Device',
      });

      await this.transport.sendMail({
        to: email,
        from: this.from,
        subject: `[${this.appName}] Your password was changed`,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send password changed notice to ${email}`, err as Error);
      throw new Error('MAIL_SEND_FAILED');
    }
  }
}
