import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { CustomIdService } from './custom-id.service';

@Module({
  controllers: [ItemsController],
  providers: [ItemsService, CustomIdService],
})
export class ItemsModule {}
