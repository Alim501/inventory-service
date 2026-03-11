import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import type { User } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  create(createCommentDto: CreateCommentDto, user: User) {
    return this.prisma.comment.create({
      data: {
        ...createCommentDto,
        userId: user.id,
      },
    });
  }

  findAll() {
    return this.prisma.comment.findMany();
  }

  findAllForInventory(inventoryId: string) {
    return this.prisma.comment.findMany({
      where: {
        inventoryId,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.comment.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, user: User) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });
    if (!comment) {
      throw new ForbiddenException(
        'Comment not found or you do not have permission to edit it',
      );
    }
    return this.prisma.comment.update({
      where: {
        id,
      },
      data: updateCommentDto,
    });
  }

  async remove(id: string, user: User) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });
    if (!comment) {
      throw new ForbiddenException(
        'Comment not found or you do not have permission to delete it',
      );
    }
    return this.prisma.comment.delete({
      where: {
        id,
      },
    });
  }
}
