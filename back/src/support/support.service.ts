import { User } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Dropbox } from 'dropbox';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class SupportService {
  private dbx: Dropbox;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.dbx = new Dropbox({
      accessToken: this.config.get('DROPBOX_ACCESS_TOKEN'),
    });
  }

  async createTicket(dto: CreateTicketDto, user: User) {
    const admins = await this.prisma.user.findMany({
      where: { isAdmin: true },
      select: { email: true },
    });

    const ticket = {
      reportedBy: user.username,
      inventory: dto.inventoryTitle ?? null,
      link: dto.pageLink,
      priority: dto.priority,
      summary: dto.summary,
      adminsEmail: admins.map((a) => a.email).filter(Boolean),
    };

    const filename = `ticket_${Date.now()}.json`;
    const content = JSON.stringify(ticket, null, 2);

    await this.dbx.filesUpload({
      path: `/support-tickets/${filename}`,
      contents: content,
    });

    return { success: true, filename };
  }
}
