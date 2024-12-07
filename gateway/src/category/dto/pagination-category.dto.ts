import { CategoryDto } from './category.dto';
import { IntersectionType } from '@nestjs/swagger';
import { PaginationRequestDTO } from '@/base/dto/base.dto';

export class PaginationCategoryDto extends IntersectionType(
  PaginationRequestDTO,
  CategoryDto,
) {}
