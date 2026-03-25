import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { SharedModule } from '@/shared/shared.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [SharedModule, PrismaModule],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
