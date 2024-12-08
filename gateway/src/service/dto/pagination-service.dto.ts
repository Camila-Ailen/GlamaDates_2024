import { ServiceDto } from './service.dto';
import { IntersectionType } from '@nestjs/swagger';
import { PaginationRequestDTO } from '@/base/dto/base.dto';

export class PaginationServiceDto extends IntersectionType(
  PaginationRequestDTO,
  ServiceDto,
) {}
