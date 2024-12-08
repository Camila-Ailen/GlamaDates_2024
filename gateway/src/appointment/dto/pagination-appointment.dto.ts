import { AppointmentDto } from './appointment.dto';
import { IntersectionType } from '@nestjs/swagger';
import { PaginationRequestDTO } from '@/base/dto/base.dto';

export class PaginationCategoryDto extends IntersectionType(
  PaginationRequestDTO,
  AppointmentDto,
) {}
