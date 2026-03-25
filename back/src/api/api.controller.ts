import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiService } from './api.service';

@Controller('v1')
export class ApiController {
  constructor(private apiService: ApiService) {}

  @Get('inventory')
  async getInventoryData(@Headers('x-api-token') token: string) {
    if (!token) throw new UnauthorizedException();
    return this.apiService.getInventoryByToken(token);
  }
}
