import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import type { User } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

const INVENTORY_INCLUDE = {
  fields: { orderBy: { fieldOrder: 'asc' as const } },
  tags: { include: { tag: true } },
};

@Injectable()
export class InventoriesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateInventoryDto, user: User) {
    const { fields, tagIds, ...inventoryData } = dto;
    return this.prisma.inventory.create({
      data: {
        ...inventoryData,
        creatorId: user.id,
        fields: fields ? { create: fields } : undefined,
        tags: tagIds?.length
          ? { create: tagIds.map((id) => ({ tagId: id })) }
          : undefined,
      },
      include: INVENTORY_INCLUDE,
    });
  }

  findAll() {
    return this.prisma.inventory.findMany({
      where: { isPublic: true },
      include: INVENTORY_INCLUDE,
    });
  }

  findAllForAdmin() {
    return this.prisma.inventory.findMany({
      include: INVENTORY_INCLUDE,
    });
  }

  findMine(user: User) {
    return this.prisma.inventory.findMany({
      where: { creatorId: user.id },
      include: INVENTORY_INCLUDE,
    });
  }

  findOne(id: string, user: User | null) {
    return this.prisma.inventory.findFirst({
      where: { id, ...this.canAccessInventoryWhere(user) },
      include: INVENTORY_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateInventoryDto, user: User) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { id, ...this.canManageWhere(user) },
    });
    const { version, fields, tagIds, ...updateData } = dto;

    if (!inventory)
      throw new ForbiddenException('Inventory not found or access denied');
    if (inventory.version !== version)
      throw new ConflictException('Inventory was modified by another user');

    return this.prisma.inventory.update({
      where: { id },
      data: {
        ...updateData,
        version: inventory.version + 1,
        ...(fields !== undefined && {
          fields: { deleteMany: {}, create: fields },
        }),
        ...(tagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      include: INVENTORY_INCLUDE,
    });
  }

  async remove(id: string, user: User, version: number) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { id, ...this.canManageWhere(user) },
    });

    if (!inventory)
      throw new ForbiddenException('Inventory not found or access denied');
    if (inventory.version !== version)
      throw new ConflictException('Inventory was modified by another user');

    return this.prisma.inventory.delete({ where: { id } });
  }

  private canAccessInventoryWhere(user: User | null) {
    if (user?.isAdmin) return {};
    return {
      OR: [
        { isPublic: true },
        { creatorId: user?.id },
        { accessUsers: { some: { userId: user?.id } } },
      ],
    };
  }

  private canManageWhere(user: User) {
    if (user.isAdmin) return {};
    return { creatorId: user.id };
  }
}
