import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '@/users/users.service';
import * as bcrypt from 'bcryptjs';
import { AuthMethod } from './enums/auth-method.enum';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
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

  private generateTokens(
    userId: string,
    email: string,
    isAdmin: boolean,
    isBlocked: boolean,
  ) {
    const payload = { sub: userId, email, isAdmin, isBlocked };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
