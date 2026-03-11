import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryFieldDto } from '../../dto/create-inventory-fields.dto';

export class UpdateInventoryFieldDto extends PartialType(
  CreateInventoryFieldDto,
) {}
