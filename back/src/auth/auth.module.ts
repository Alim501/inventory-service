import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@/users/users.module';
import { MailModule } from '@/mail/mail.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { SharedModule } from '@/shared/shared.module';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    SharedModule,
    UsersModule,
    MailModule,
    PrismaModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}
