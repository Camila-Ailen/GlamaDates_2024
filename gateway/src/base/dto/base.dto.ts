import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class PaginationRequestDTO {
  @ApiProperty({ required: true, default: 0 })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiProperty({ required: true, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  pageSize?: number;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiProperty({ required: false, type: 'string', default: 'ASC' })
  @IsOptional()
  @IsString()
  orderType?: 'ASC' | 'DESC';
}

export class PaginationResponseDTO {
  @ApiProperty({ required: true })
  @IsNumber()
  total: number;

  @ApiProperty({ required: true })
  @IsNumber()
  pageSize: number;

  @ApiProperty({ required: true })
  @IsNumber()
  offset: number;

  @ApiProperty({ required: true })
  @IsNumber()
  results: any[];
}

export class ResposeDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  status: 'success' | 'error';

  @ApiProperty({ required: false })
  @IsOptional()
  data?: any;
}

export class IdDTO {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  id: number;
}

export class RoleDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderType?: 'ASC' | 'DESC';
}
