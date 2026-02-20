import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserAdminDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['en', 'ru'], { message: 'Language must be en or ru' })
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark'], { message: 'Theme must be light or dark' })
  preferredTheme?: string;
}
