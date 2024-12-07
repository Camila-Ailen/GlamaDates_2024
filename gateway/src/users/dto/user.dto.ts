import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';
import { Role } from '@/roles/entities/role.entity';

export class UserDto {
  @IsOptional()
  id: number;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  email: string;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  role: Role;

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
