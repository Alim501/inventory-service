import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TelegramAuthDto {
  @IsInt()
  id: number;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  photo_url?: string;

  @IsInt()
  auth_date: number;

  @IsString()
  @IsNotEmpty()
  hash: string;
}
