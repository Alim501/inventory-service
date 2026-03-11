import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { CurrentUser } from '@/auth/decorators/user.decorator';
import type { User } from '@/generated/prisma/client';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateLikeDto, @CurrentUser() user: User) {
    return this.likesService.create(dto.itemId, user);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.likesService.findAll();
  }

  @UseGuards(AuthGuard)
  @Delete(':itemId')
  remove(@Param('itemId') itemId: string, @CurrentUser() user: User) {
    return this.likesService.remove(itemId, user);
  }
}
