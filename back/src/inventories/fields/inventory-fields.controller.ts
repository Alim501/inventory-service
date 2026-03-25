import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { CurrentUser } from '@/auth/decorators/user.decorator';
import type { User } from '@/generated/prisma/client';
import { CreateInventoryFieldDto } from '../dto/create-inventory-fields.dto';
import { ReorderFieldsDto } from './dto/reorder-fields.dto';
import { InventoryFieldsService } from './inventory-fields.service';
import { UpdateInventoryFieldDto } from './dto/update-inventory-fields.dto';

@Controller('inventories/:inventoryId/fields')
@UseGuards(AuthGuard)
export class InventoryFieldsController {
  constructor(
    private readonly InventoryFieldsService: InventoryFieldsService,
  ) {}

  @Post()
  create(
    @Param('inventoryId') inventoryId: string,
    @Body() dto: CreateInventoryFieldDto,
    @CurrentUser() user: User,
  ) {
    return this.InventoryFieldsService.create(inventoryId, dto, user);
  }

  @Patch('reorder')
  reorder(
    @Param('inventoryId') inventoryId: string,
    @Body() dto: ReorderFieldsDto,
    @CurrentUser() user: User,
  ) {
    return this.InventoryFieldsService.reorder(inventoryId, dto, user);
  }

  @Patch(':fieldId')
  update(
    @Param('inventoryId') inventoryId: string,
    @Param('fieldId') fieldId: string,
    @Body() dto: UpdateInventoryFieldDto,
    @CurrentUser() user: User,
  ) {
    return this.InventoryFieldsService.update(inventoryId, fieldId, dto, user);
  }

  @Delete(':fieldId')
  remove(
    @Param('inventoryId') inventoryId: string,
    @Param('fieldId') fieldId: string,
    @CurrentUser() user: User,
  ) {
    return this.InventoryFieldsService.remove(inventoryId, fieldId, user);
  }
}
