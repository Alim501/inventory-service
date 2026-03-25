import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { AdminGuard } from '@/shared/guards/admin.guard';
import { CurrentUser } from '@/auth/decorators/user.decorator';
import type { User } from '@/generated/prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('search')
  async findByUsername(@Query('username') username: string) {
    if (!username) throw new NotFoundException('Username is required');
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    return { id: user.id, username: user.username };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  async updateCurrentUser(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch(':id')
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserAdminDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
