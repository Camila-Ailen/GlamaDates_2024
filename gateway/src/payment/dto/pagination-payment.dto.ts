import { PaymentDto } from './payment.dto';
import { IntersectionType } from '@nestjs/swagger';
import { PaginationRequestDTO } from '@/base/dto/base.dto';

export class PaginationPaymentDto extends IntersectionType(
  PaginationRequestDTO,
  PaymentDto,
) {}
