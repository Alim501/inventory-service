import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import type { User } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { randomBytes } from 'crypto';

const INVENTORY_INCLUDE = {
  fields: { orderBy: { fieldOrder: 'asc' as const } },
  tags: { include: { tag: true } },
  accessUsers: { select: { userId: true } },
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
      where: {
        OR: [
          { creatorId: user.id },
          { accessUsers: { some: { userId: user.id } } },
        ],
      },
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

  async grantAccess(inventoryId: string, targetUserId: string, user: User) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { id: inventoryId, ...this.canManageWhere(user) },
    });
    if (!inventory)
      throw new ForbiddenException('Inventory not found or access denied');
    if (inventory.creatorId === targetUserId)
      throw new ForbiddenException('Cannot grant access to the owner');

    return this.prisma.inventoryAccess.upsert({
      where: { inventoryId_userId: { inventoryId, userId: targetUserId } },
      create: { inventoryId, userId: targetUserId },
      update: {},
    });
  }

  async revokeAccess(inventoryId: string, targetUserId: string, user: User) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { id: inventoryId, ...this.canManageWhere(user) },
    });
    if (!inventory)
      throw new ForbiddenException('Inventory not found or access denied');

    const access = await this.prisma.inventoryAccess.findUnique({
      where: { inventoryId_userId: { inventoryId, userId: targetUserId } },
    });
    if (!access) throw new NotFoundException('Access record not found');

    return this.prisma.inventoryAccess.delete({
      where: { inventoryId_userId: { inventoryId, userId: targetUserId } },
    });
  }

  async listAccess(inventoryId: string, user: User) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { id: inventoryId, ...this.canManageWhere(user) },
    });
    if (!inventory)
      throw new ForbiddenException('Inventory not found or access denied');

    return this.prisma.inventoryAccess.findMany({
      where: { inventoryId },
      include: { user: { select: { id: true, username: true, email: true } } },
    });
  }

  async generateApiToken(inventoryId: string, user: User) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { id: inventoryId, ...this.canManageWhere(user) },
    });

    if (!inventory) throw new ForbiddenException('Access denied');

    const token = randomBytes(32).toString('hex');

    return this.prisma.inventory.update({
      where: { id: inventoryId },
      data: { apiToken: token },
      select: { apiToken: true },
    });
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
    return {
      OR: [
        { creatorId: user.id },
        { accessUsers: { some: { userId: user.id } } },
      ],
    };
  }
}
