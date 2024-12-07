import { IsString, IsOptional, IsArray } from 'class-validator';
import { Permission } from '@/permissions/entities/permission.entity';

export class RoleDto {
  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  permissions?: Permission[];
}
