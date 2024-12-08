import { PackageDto } from './package.dto';
import { IntersectionType } from '@nestjs/swagger';
import { PaginationRequestDTO } from '@/base/dto/base.dto';

export class PaginationPackageDto extends IntersectionType(
  PaginationRequestDTO,
  PackageDto,
) {}
