import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InventoriesService } from './inventories.service';
import { InventoriesController } from './inventories.controller';
import { InventoryFieldsController } from './fields/inventory-fields.controller';
import { InventoryFieldsService } from './fields/inventory-fields.service';

@Module({
  imports: [JwtModule],
  controllers: [InventoriesController, InventoryFieldsController],
  providers: [InventoriesService, InventoryFieldsService],
})
export class InventoriesModule {}
