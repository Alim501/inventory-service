import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';

@Module({
  imports: [JwtModule],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
