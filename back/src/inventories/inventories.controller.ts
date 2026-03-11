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
import { InventoriesService } from './inventories.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { CurrentUser } from '@/auth/decorators/user.decorator';
import type { User } from '@/generated/prisma/client';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { OptionalAuthGuard } from '@/auth/guards/optional-auth.guard';

@Controller('inventories')
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createInventoryDto: CreateInventoryDto,
    @CurrentUser() user: User,
  ) {
    return this.inventoriesService.create(createInventoryDto, user);
  }

  @Get()
  findAll() {
    return this.inventoriesService.findAll();
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('admin')
  findAllForAdmin() {
    return this.inventoriesService.findAllForAdmin();
  }

  @UseGuards(AuthGuard)
  @Get('my')
  findMine(@CurrentUser() user: User) {
    return this.inventoriesService.findMine(user);
  }

  @UseGuards(OptionalAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User | null) {
    return this.inventoriesService.findOne(id, user);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @CurrentUser() user: User,
  ) {
    return this.inventoriesService.update(id, updateInventoryDto, user);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('version') version: number,
  ) {
    return this.inventoriesService.remove(id, user, version);
  }
}
