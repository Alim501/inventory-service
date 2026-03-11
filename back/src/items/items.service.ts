import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from '@/prisma/prisma.service';
import type { User } from '@/generated/prisma/client';
import { CustomIdService } from './custom-id.service';

const ITEM_INCLUDE = (userId?: string) => ({
  fieldValues: true,
  _count: { select: { likes: true } },
  ...(userId ? { likes: { where: { userId }, select: { userId: true } } } : {}),
});

@Injectable()
export class ItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customIdService: CustomIdService,
  ) {}

  async create(inventoryId: string, dto: CreateItemDto, user: User) {
    const fields = await this.prisma.inventoryField.findMany({
      where: { inventoryId },
    });

    const fieldMap = new Map(fields.map((f) => [f.id, f]));

    for (const value of dto.fieldValues ?? []) {
      const field = fieldMap.get(value.fieldId);

      if (!field) {
        throw new BadRequestException(
          `Field ${value.fieldId} does not belong to this inventory`,
        );
      }

      if (field.fieldType === 'number' && value.numericValue === undefined) {
        throw new BadRequestException(
          `Field "${field.fieldName}" expects a number`,
        );
      }
      if (field.fieldType === 'boolean' && value.booleanValue === undefined) {
        throw new BadRequestException(
          `Field "${field.fieldName}" expects a boolean`,
        );
      }
      if (
        ['text_single', 'text_multi', 'image'].includes(field.fieldType) &&
        value.textValue === undefined
      ) {
        throw new BadRequestException(
          `Field "${field.fieldName}" expects a string`,
        );
      }
    }

    const customId =
      dto.customId ?? (await this.customIdService.generate(inventoryId));

    return this.prisma.item.create({
      data: {
        inventoryId,
        creatorId: user.id,
        customId,
        fieldValues: {
          create: dto.fieldValues ?? [],
        },
      },
      include: ITEM_INCLUDE(user.id),
    });
  }

  async findAll(inventoryId: string, user?: User) {
    return this.prisma.item.findMany({
      where: { inventoryId },
      include: ITEM_INCLUDE(user?.id),
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(inventoryId: string, itemId: string, user?: User) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId, inventoryId },
      include: ITEM_INCLUDE(user?.id),
    });
    if (!item) throw new NotFoundException(`Item ${itemId} not found`);
    return item;
  }

  async update(
    inventoryId: string,
    itemId: string,
    dto: UpdateItemDto,
    user: User,
  ) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId, inventoryId },
    });
    if (!item) throw new NotFoundException(`Item ${itemId} not found`);

    if (!user.isAdmin && item.creatorId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to edit this item',
      );
    }

    if (item.version !== dto.version) {
      throw new BadRequestException(
        'Version conflict: item was modified by someone else',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fieldValues, customId, version: _v, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (fieldValues && fieldValues.length > 0) {
        for (const fv of fieldValues) {
          await tx.itemFieldValue.upsert({
            where: { itemId_fieldId: { itemId, fieldId: fv.fieldId } },
            create: { itemId, ...fv },
            update: {
              textValue: fv.textValue,
              numericValue: fv.numericValue,
              booleanValue: fv.booleanValue,
            },
          });
        }
      }

      return tx.item.update({
        where: { id: itemId },
        data: {
          ...(customId !== undefined ? { customId } : {}),
          ...rest,
          version: { increment: 1 },
        },
        include: ITEM_INCLUDE(user.id),
      });
    });
  }

  async remove(inventoryId: string, itemId: string, user: User) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId, inventoryId },
    });
    if (!item) throw new NotFoundException(`Item ${itemId} not found`);

    if (!user.isAdmin && item.creatorId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this item',
      );
    }

    await this.prisma.item.delete({ where: { id: itemId } });
  }

  async bulkRemove(inventoryId: string, ids: string[], user: User) {
    if (!user.isAdmin) {
      // ensure all items belong to this user
      const items = await this.prisma.item.findMany({
        where: { id: { in: ids }, inventoryId },
        select: { creatorId: true },
      });
      const allOwned = items.every((i) => i.creatorId === user.id);
      if (!allOwned) {
        throw new ForbiddenException(
          'You do not have permission to delete some of these items',
        );
      }
    }

    await this.prisma.item.deleteMany({
      where: { id: { in: ids }, inventoryId },
    });
  }
}
