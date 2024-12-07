import { IntersectionType } from '@nestjs/swagger';
import { PaginationRequestDTO } from '@/base/dto/base.dto';
import { UserDto } from './user.dto';

export class UserPaginationDto extends IntersectionType(
  PaginationRequestDTO,
  UserDto,
) {}
