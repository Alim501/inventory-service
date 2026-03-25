import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { SharedModule } from '@/shared/shared.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [SharedModule, PrismaModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
