import { DetailsAppointmentDto } from './details-appointment.dto';
import { IntersectionType } from '@nestjs/swagger';
import { PaginationRequestDTO } from '@/base/dto/base.dto';

export class PaginationDetailsAppointmentDto extends IntersectionType(
  PaginationRequestDTO,
  DetailsAppointmentDto,
) {}
