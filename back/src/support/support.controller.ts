import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CurrentUser } from '@/auth/decorators/user.decorator';
import type { User } from '@/generated/prisma/client';
import { AuthGuard } from '@/shared/guards/auth.guard';

@Controller('support')
@UseGuards(AuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('ticket')
  createTicket(@Body() dto: CreateTicketDto, @CurrentUser() user: User) {
    return this.supportService.createTicket(dto, user);
  }
}
