import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';
import { AuthMethod } from '../enums/auth-method.enum';

export class LoginDto {
  @IsEnum(AuthMethod, {
    message: 'authMethod must be one of: password, google, telegram',
  })
  authMethod!: AuthMethod;

  @ValidateIf((o: LoginDto) => o.authMethod === AuthMethod.PASSWORD)
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required for password auth' })
  email?: string;

  @ValidateIf((o: LoginDto) => o.authMethod === AuthMethod.PASSWORD)
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password?: string;

  @ValidateIf((o: LoginDto) => o.authMethod === AuthMethod.GOOGLE)
  @IsString()
  @IsNotEmpty({ message: 'Google ID is required' })
  googleId?: string;

  @ValidateIf((o: LoginDto) => o.authMethod === AuthMethod.TELEGRAM)
  @IsString()
  @IsNotEmpty({ message: 'Telegram ID is required' })
  telegramId?: string;
}
