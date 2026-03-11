import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { FieldType } from '../enums/field-types.enum';

export class CreateInventoryFieldDto {
  @IsString()
  fieldName!: string;

  @IsEnum(FieldType)
  fieldType!: FieldType;

  @IsNumber()
  fieldOrder!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  showInTable!: boolean;
}
