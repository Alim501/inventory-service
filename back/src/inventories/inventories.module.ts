import { Module } from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { InventoriesController } from './inventories.controller';
import { InventoryFieldsController } from './fields/inventory-fields.controller';
import { InventoryFieldsService } from './fields/inventory-fields.service';
import { SharedModule } from '@/shared/shared.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [SharedModule, PrismaModule],
  controllers: [InventoriesController, InventoryFieldsController],
  providers: [InventoriesService, InventoryFieldsService],
})
export class InventoriesModule {}
