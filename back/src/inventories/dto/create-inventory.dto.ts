import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { CreateInventoryFieldDto } from './create-inventory-fields.dto';

export class CreateInventoryDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsBoolean()
  isPublic!: boolean;

  @IsOptional()
  customIdFormat?: object;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInventoryFieldDto)
  @IsOptional()
  fields?: CreateInventoryFieldDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];
}
