import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { OptionalAuthGuard } from '@/auth/guards/optional-auth.guard';
import { CurrentUser } from '@/auth/decorators/user.decorator';
import type { User } from '@/generated/prisma/client';

@Controller('inventories/:inventoryId/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Param('inventoryId') inventoryId: string,
    @Body() createItemDto: CreateItemDto,
    @CurrentUser() user: User,
  ) {
    return this.itemsService.create(inventoryId, createItemDto, user);
  }

  @UseGuards(OptionalAuthGuard)
  @Get()
  findAll(
    @Param('inventoryId') inventoryId: string,
    @CurrentUser() user?: User,
  ) {
    return this.itemsService.findAll(inventoryId, user);
  }

  @UseGuards(OptionalAuthGuard)
  @Get(':id')
  findOne(
    @Param('inventoryId') inventoryId: string,
    @Param('id') id: string,
    @CurrentUser() user?: User,
  ) {
    return this.itemsService.findOne(inventoryId, id, user);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('inventoryId') inventoryId: string,
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
    @CurrentUser() user: User,
  ) {
    return this.itemsService.update(inventoryId, id, updateItemDto, user);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(
    @Param('inventoryId') inventoryId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.itemsService.remove(inventoryId, id, user);
  }

  @UseGuards(AuthGuard)
  @Delete()
  bulkRemove(
    @Param('inventoryId') inventoryId: string,
    @Body() body: { ids: string[] },
    @CurrentUser() user: User,
  ) {
    return this.itemsService.bulkRemove(inventoryId, body.ids, user);
  }
}
