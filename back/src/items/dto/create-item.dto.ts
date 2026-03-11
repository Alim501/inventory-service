import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateItemFieldValueDto {
  @IsString()
  fieldId!: string;

  @IsString()
  @IsOptional()
  textValue?: string;

  @IsNumber()
  @IsOptional()
  numericValue?: number;

  @IsBoolean()
  @IsOptional()
  booleanValue?: boolean;
}

export class CreateItemDto {
  @IsString()
  @IsOptional()
  customId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemFieldValueDto)
  @IsOptional()
  fieldValues?: CreateItemFieldValueDto[];
}
