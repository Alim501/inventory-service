import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@/generated/prisma/client';
import type { User } from '@/generated/prisma/client';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async create(itemId: string, user: User) {
    try {
      return await this.prisma.like.create({
        data: {
          user: { connect: { id: user.id } },
          item: { connect: { id: itemId } },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Item ${itemId} not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('You have already liked this item');
        }
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.like.findMany();
  }

  findQuantityForItem(itemId: string) {
    return this.prisma.like.count({
      where: {
        itemId,
      },
    });
  }

  async remove(itemId: string, user: User) {
    try {
      return await this.prisma.like.delete({
        where: { itemId_userId: { itemId, userId: user.id } },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Like not found');
      }
      throw error;
    }
  }
}
