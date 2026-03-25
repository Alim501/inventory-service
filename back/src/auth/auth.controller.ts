import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/user.decorator';
import { UsersService } from '@/users/users.service';
import type { User } from '@/generated/prisma/client';

interface CookieResponse {
  cookie(name: string, value: string, options?: Record<string, unknown>): void;
  clearCookie(name: string, options?: Record<string, unknown>): void;
}

interface CookieRequest {
  cookies?: Record<string, string>;
  user?: { accessToken: string; refreshToken: string };
}

const REFRESH_TOKEN_COOKIE = 'refresh_token';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: CookieResponse,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken };
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: CookieResponse,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.register(registerDto);
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @Req() req: CookieRequest,
    @Res({ passthrough: true }) res: CookieResponse,
  ) {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!token) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const { accessToken, refreshToken } = this.authService.refresh(token);
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: CookieResponse) {
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/auth' });
    return { message: 'Logged out' };
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────

  @Get('google')
  @UseGuards(PassportAuthGuard('google'))
  googleAuth() {
    // Passport redirects to Google automatically
  }

  @Get('google/callback')
  @UseGuards(PassportAuthGuard('google'))
  googleCallback(@Req() req: CookieRequest, @Res() res: Response) {
    const { accessToken, refreshToken } = req.user!;
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...REFRESH_COOKIE_OPTIONS,
      path: '/',
    });
    res.redirect(
      `${process.env.CLIENT_URL ?? 'http://localhost:5173'}?accessToken=${accessToken}`,
    );
  }

  // ── Telegram OAuth ────────────────────────────────────────────────────────

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('telegram/callback')
  @HttpCode(HttpStatus.OK)
  async telegramCallback(
    @Body() data: TelegramAuthDto,
    @Res({ passthrough: true }) res: CookieResponse,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.validateTelegramAuth(data);
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken };
  }
}
