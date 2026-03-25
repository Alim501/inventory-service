import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  summary!: string;

  @IsEnum(['High', 'Average', 'Low'])
  priority!: 'High' | 'Average' | 'Low';

  @IsString()
  @IsOptional()
  inventoryTitle?: string;

  @IsString()
  pageLink!: string;
}
