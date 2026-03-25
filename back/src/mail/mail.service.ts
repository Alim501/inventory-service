import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import BrevoTransport from 'nodemailer-brevo-transport';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport(
      new BrevoTransport({ apiKey: this.config.get<string>('BREVO_API_KEY')! }),
    );
  }

  async sendWelcome(to: string, username: string) {
    await this.transporter.sendMail({
      from: '"iLearning" <no-reply@ilearning.app>',
      to,
      subject: 'Welcome to iLearning!',
      html: `<h2>Hi, ${username}!</h2><p>Welcome to iLearning. Your account is ready.</p>`,
    });
  }

  async sendPasswordReset(to: string, token: string) {
    const link = `${this.config.get('CLIENT_URL')}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: '"iLearning" <no-reply@ilearning.app>',
      to,
      subject: 'Password reset',
      html: `<p>Click the link to reset your password (valid for 1 hour):</p><a href="${link}">${link}</a>`,
    });
  }
}
