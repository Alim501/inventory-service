import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class ReorderFieldsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderFieldItemDto)
  fields!: ReorderFieldItemDto[];
}

class ReorderFieldItemDto {
  @IsString()
  id!: string;

  @IsNumber()
  fieldOrder!: number;
}
