import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';

@Module({
  imports: [JwtModule],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
