import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  inventoryId!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
