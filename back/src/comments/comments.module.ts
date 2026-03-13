import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

@Module({
  imports: [JwtModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
