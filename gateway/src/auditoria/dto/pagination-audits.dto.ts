import { IntersectionType } from '@nestjs/swagger';
import { PaginationRequestDTO } from '@/base/dto/base.dto';
import { AuditoriaDto } from './audits.dto';

export class AuditsPaginationDto extends IntersectionType(
  PaginationRequestDTO,
  AuditoriaDto
) {}
