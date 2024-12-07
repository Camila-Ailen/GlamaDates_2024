import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';
import { Role } from '@/roles/entities/role.entity';
import { Category } from '@/category/entities/category.entity';

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
  gender: string;

  //fecha de nacimiento
  @ApiProperty({ required: false})
  @IsOptional()
  @IsDate()
  birthdate: Date;

  //telefono
  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsArray()
  categories?: Category[];

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
