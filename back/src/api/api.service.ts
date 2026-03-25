import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@/generated/prisma/client';

type InventoryWithData = Prisma.InventoryGetPayload<{
  include: {
    fields: { orderBy: { fieldOrder: 'asc' } };
    items: { include: { fieldValues: { include: { field: true } } } };
  };
}>;

@Injectable()
export class ApiService {
  constructor(private prisma: PrismaService) {}

  async getInventoryByToken(token: string) {
    if (!token) throw new UnauthorizedException();

    const inventory = await this.prisma.inventory.findFirst({
      where: { apiToken: token },
      include: {
        fields: { orderBy: { fieldOrder: 'asc' } },
        items: {
          include: { fieldValues: { include: { field: true } } },
        },
      },
    });

    if (!inventory) throw new UnauthorizedException();

    return this.buildAggregatedResponse(inventory);
  }

  private buildAggregatedResponse(inventory: InventoryWithData) {
    const fieldsWithAggregations = inventory.fields.map((field) => {
      const values = inventory.items
        .flatMap((item) => item.fieldValues)
        .filter((fv) => fv.fieldId === field.id);

      let aggregation = null;

      if (field.fieldType === 'number') {
        const nums = values
          .map((v) => Number(v.numericValue))
          .filter((n) => !isNaN(n));

        aggregation = nums.length
          ? {
              min: Math.min(...nums),
              max: Math.max(...nums),
              avg: nums.reduce((a, b) => a + b, 0) / nums.length,
            }
          : null;
      }

      if (['text_single', 'text_multi'].includes(field.fieldType)) {
        const texts = values
          .map((v) => v.textValue)
          .filter((v): v is string => v !== null && v !== undefined);
        const freq = texts.reduce<Record<string, number>>((acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {});
        const sorted = Object.entries(freq)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 3)
          .map(([value, count]) => ({ value, count }));

        aggregation = { topValues: sorted };
      }

      return {
        fieldName: field.fieldName,
        fieldType: field.fieldType,
        aggregation,
      };
    });

    return {
      title: inventory.title,
      description: inventory.description,
      category: inventory.category,
      itemCount: inventory.items.length,
      fields: fieldsWithAggregations,
    };
  }
}
