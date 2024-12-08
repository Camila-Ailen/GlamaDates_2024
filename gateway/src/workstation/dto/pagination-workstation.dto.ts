import { WorkstationDto } from './workstation.dto';
import { IntersectionType } from '@nestjs/swagger';
import { PaginationRequestDTO } from '@/base/dto/base.dto';

export class PaginationWorkstationDto extends IntersectionType(
  PaginationRequestDTO,
  WorkstationDto,
) {}
