import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';

export class AuditoriaDto {
  @IsOptional()
  @IsNumber()
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === null || value === undefined || value === '' ? null : Number(value))
  @IsNumber({}, { each: false })
  userId: number | null;

  @ApiProperty({ required: true, type: 'string' })
  @IsOptional()
  @IsString()
  entity: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsOptional()
  @IsString()
  accion: string;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  date: Date;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  oldData: any;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  newData: any;
}