import { IntersectionType, PartialType } from '@nestjs/swagger';
import { SystemConfigDto } from './system-config.dto';
import { PaginationRequestDTO } from '@/base/dto/base.dto';

export class PaginationSystemConfigDto extends IntersectionType(
    PaginationRequestDTO,
    SystemConfigDto,
  ) {}
  