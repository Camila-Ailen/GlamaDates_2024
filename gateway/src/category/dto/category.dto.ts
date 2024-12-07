
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class CategoryDto {
  @IsOptional()
  id: number;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsDate()
  created_at: Date;

  @IsOptional()
  @IsDate()
  updated_at: Date;

  @IsOptional()
  @IsDate()
  deleted_at: Date;
}
