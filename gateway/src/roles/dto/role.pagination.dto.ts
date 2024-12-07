import { IntersectionType } from '@nestjs/swagger';
import { PaginationRequestDTO } from '@/base/dto/base.dto';
import { RoleDto } from './role.dto';

export class RolePaginationDto extends IntersectionType(
  PaginationRequestDTO,
  RoleDto,
) {}
