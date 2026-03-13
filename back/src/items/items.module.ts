import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { CustomIdService } from './custom-id.service';

@Module({
  imports: [JwtModule],
  controllers: [ItemsController],
  providers: [ItemsService, CustomIdService],
})
export class ItemsModule {}
