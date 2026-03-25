import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

interface FormatElement {
  type:
    | 'fixed'
    | 'sequence'
    | 'random_20bit'
    | 'random_32bit'
    | 'random_6digit'
    | 'random_9digit'
    | 'guid'
    | 'datetime';
  value?: string;
  format?: string;
}

@Injectable()
export class CustomIdService {
  constructor(private prisma: PrismaService) {}

  async generate(inventoryId: string): Promise<string> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id: inventoryId },
    });

    if (!inventory?.customIdFormat) {
      return randomUUID();
    }

    const format = inventory.customIdFormat as unknown as {
      elements: FormatElement[];
    };
    const parts: string[] = [];

    for (const element of format.elements) {
      parts.push(await this.processElement(element, inventoryId));
    }

    return parts.join('');
  }

  private async processElement(
    element: FormatElement,
    inventoryId: string,
  ): Promise<string> {
    switch (element.type) {
      case 'fixed':
        return element.value ?? '';

      case 'sequence':
        return this.generateSequence(inventoryId, element.format ?? 'D1');

      case 'random_20bit':
        return this.randomHex(5);

      case 'random_32bit':
        return this.randomHex(8);

      case 'random_6digit':
        return this.randomDigits(6);

      case 'random_9digit':
        return this.randomDigits(9);

      case 'guid':
        return randomUUID();

      case 'datetime':
        return this.formatDate(new Date(), element.format ?? 'yyyy-MM-dd');

      default:
        return '';
    }
  }

  private async generateSequence(
    inventoryId: string,
    format: string,
  ): Promise<string> {
    const items = await this.prisma.item.findMany({
      where: { inventoryId },
      select: { customId: true },
    });

    let max = 0;
    for (const item of items) {
      const num = parseInt(item.customId ?? '0');
      if (!isNaN(num) && num > max) max = num;
    }

    const next = max + 1;
    const digits = parseInt(format.replace('D', ''));
    return String(next).padStart(digits, '0');
  }

  private randomHex(length: number): string {
    return [...Array(length)]
      .map(() =>
        Math.floor(Math.random() * 16)
          .toString(16)
          .toUpperCase(),
      )
      .join('');
  }

  private randomDigits(length: number): string {
    return [...Array(length)]
      .map(() => Math.floor(Math.random() * 10).toString())
      .join('');
  }

  private formatDate(date: Date, format: string): string {
    return format
      .replace('yyyy', String(date.getFullYear()))
      .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
      .replace('dd', String(date.getDate()).padStart(2, '0'))
      .replace('HH', String(date.getHours()).padStart(2, '0'))
      .replace('mm', String(date.getMinutes()).padStart(2, '0'));
  }
}
