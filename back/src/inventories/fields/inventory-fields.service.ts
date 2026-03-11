import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { User } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { FieldType } from '../enums/field-types.enum';
import { CreateInventoryFieldDto } from '../dto/create-inventory-fields.dto';
import { ReorderFieldsDto } from './dto/reorder-fields.dto';
import { UpdateInventoryFieldDto } from './dto/update-inventory-fields.dto';

@Injectable()
export class InventoryFieldsService {
  constructor(private prisma: PrismaService) {}

  private async checkOwnership(inventoryId: string, user: User) {
    const inventory = await this.prisma.inventory.findFirst({
      where: {
        id: inventoryId,
        ...(user.isAdmin ? {} : { creatorId: user.id }),
      },
    });
    if (!inventory) throw new ForbiddenException('Access denied');
    return inventory;
  }

  private async validateFieldLimit(inventoryId: string, fieldType: FieldType) {
    const count = await this.prisma.inventoryField.count({
      where: { inventoryId, fieldType },
    });
    if (count >= 3) {
      throw new BadRequestException(`Maximum 3 fields of type ${fieldType}`);
    }
  }

  async create(inventoryId: string, dto: CreateInventoryFieldDto, user: User) {
    await this.checkOwnership(inventoryId, user);
    await this.validateFieldLimit(inventoryId, dto.fieldType);

    return this.prisma.inventoryField.create({
      data: { ...dto, inventoryId },
    });
  }

  async reorder(inventoryId: string, dto: ReorderFieldsDto, user: User) {
    await this.checkOwnership(inventoryId, user);

    return this.prisma.$transaction(
      dto.fields.map(({ id, fieldOrder }) =>
        this.prisma.inventoryField.update({
          where: { id },
          data: { fieldOrder },
        }),
      ),
    );
  }

  async update(
    inventoryId: string,
    fieldId: string,
    dto: UpdateInventoryFieldDto,
    user: User,
  ) {
    await this.checkOwnership(inventoryId, user);

    return this.prisma.inventoryField.update({
      where: { id: fieldId, inventoryId },
      data: dto,
    });
  }

  async remove(inventoryId: string, fieldId: string, user: User) {
    await this.checkOwnership(inventoryId, user);

    return this.prisma.inventoryField.delete({
      where: { id: fieldId, inventoryId },
    });
  }
}
