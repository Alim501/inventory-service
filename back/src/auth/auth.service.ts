import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UsersService } from '@/users/users.service';
import { MailService } from '@/mail/mail.service';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { AuthMethod } from './enums/auth-method.enum';
import type { Profile } from 'passport-google-oauth20';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private prisma: PrismaService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);
    return this.generateTokens(
      user.id,
      user.username,
      user.isAdmin,
      user.isBlocked,
    );
  }

  async register(registerDto: RegisterDto) {
    let user;
    switch (registerDto.authMethod) {
      case AuthMethod.PASSWORD: {
        const existingEmail = await this.userService.findByEmail(
          registerDto.email!,
        );
        if (existingEmail) {
          throw new ConflictException('Email already in use');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password!, 10);
        user = await this.userService.create({
          email: registerDto.email!,
          username: registerDto.username,
          password: hashedPassword,
        });
        this.mailService
          .sendWelcome(registerDto.email!, registerDto.username)
          .catch(() => null);
        break;
      }
      case AuthMethod.GOOGLE: {
        const existingGoogle = await this.userService.findByGoogleId(
          registerDto.googleId!,
        );
        if (existingGoogle) {
          throw new ConflictException('Google ID already in use');
        }
        user = await this.userService.create({
          username: registerDto.username,
          googleId: registerDto.googleId,
        });
        break;
      }
      case AuthMethod.TELEGRAM: {
        const existingTelegram = await this.userService.findByTelegramId(
          registerDto.telegramId!,
        );
        if (existingTelegram) {
          throw new ConflictException('Telegram ID already in use');
        }
        user = await this.userService.create({
          username: registerDto.username,
          telegramId: registerDto.telegramId,
        });
        break;
      }
    }

    return this.generateTokens(
      user.id,
      user.username,
      user.isAdmin,
      user.isBlocked,
    );
  }

  refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      return this.generateTokens(
        payload.sub,
        payload.username,
        payload.isAdmin,
        payload.isBlocked,
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateOrCreateGoogleUser(profile: Profile) {
    const googleId = profile.id;
    let user = await this.userService.findByGoogleId(googleId);
    if (!user) {
      user = await this.userService.create({
        googleId,
        username: profile.displayName ?? profile.emails?.[0]?.value ?? googleId,
        email: profile.emails?.[0]?.value,
      });
    }
    return this.generateTokens(
      user.id,
      user.username,
      user.isAdmin,
      user.isBlocked,
    );
  }

  async validateTelegramAuth(data: TelegramAuthDto) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) throw new UnauthorizedException('Telegram not configured');

    const { hash, ...fields } = data;
    const checkStr = Object.entries(fields)
      .filter(([, v]) => v !== undefined && v !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const secret = crypto.createHash('sha256').update(botToken).digest();
    const computedHash = crypto
      .createHmac('sha256', secret)
      .update(checkStr)
      .digest('hex');

    if (computedHash !== hash) {
      throw new UnauthorizedException('Invalid Telegram auth data');
    }

    if (Date.now() / 1000 - data.auth_date > 86400) {
      throw new UnauthorizedException('Telegram auth data expired');
    }

    const telegramId = String(data.id);
    let user = await this.userService.findByTelegramId(telegramId);
    if (!user) {
      user = await this.userService.create({
        telegramId,
        username: data.username ?? data.first_name,
      });
    }
    return this.generateTokens(
      user.id,
      user.username,
      user.isAdmin,
      user.isBlocked,
    );
  }

  private async validateUser(loginDto: LoginDto) {
    switch (loginDto.authMethod) {
      case AuthMethod.PASSWORD: {
        const user = await this.userService.findByEmail(loginDto.email!);
        if (!user || !user.password) {
          throw new UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(
          loginDto.password!,
          user.password,
        );
        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid credentials');
        }
        return user;
      }
      case AuthMethod.GOOGLE: {
        const user = await this.userService.findByGoogleId(loginDto.googleId!);
        if (!user) {
          throw new UnauthorizedException('Google account not found');
        }
        return user;
      }
      case AuthMethod.TELEGRAM: {
        const user = await this.userService.findByTelegramId(
          loginDto.telegramId!,
        );
        if (!user) {
          throw new UnauthorizedException('Telegram account not found');
        }
        return user;
      }
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) return { message: 'If the email exists, a reset link was sent' };

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: token, resetPasswordExpires: expires },
    });

    this.mailService.sendPasswordReset(dto.email, token).catch(() => null);
    return { message: 'If the email exists, a reset link was sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { resetPasswordToken: dto.token },
    });

    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Password updated' };
  }

  private generateTokens(
    userId: string,
    username: string,
    isAdmin: boolean,
    isBlocked: boolean,
  ) {
    const payload = { sub: userId, username, isAdmin, isBlocked };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
