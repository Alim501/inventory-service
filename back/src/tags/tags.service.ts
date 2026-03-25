import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTagDto) {
    return this.prisma.tag.create({ data: { name: dto.name } });
  }

  findOrCreate(name: string) {
    return this.prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }

  findAll(search?: string) {
    return this.prisma.tag.findMany({
      where: search
        ? { name: { contains: search, mode: 'insensitive' } }
        : undefined,
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.tag.findUniqueOrThrow({ where: { id } });
  }

  update(id: string, dto: UpdateTagDto) {
    return this.prisma.tag.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.tag.delete({ where: { id } });
  }
}
