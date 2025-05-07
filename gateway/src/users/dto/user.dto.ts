import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';
import { Role } from '@/roles/entities/role.entity';
import { Category } from '@/category/entities/category.entity';
import { Appointment } from '@/appointment/entities/appointment.entity';
import { DetailsAppointment } from '@/details-appointment/entities/details-appointment.entity';
import { Transform } from 'class-transformer';

export class UserDto {
  @IsOptional()
  id: number;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  email: string;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  gender: string;

  //fecha de nacimiento
  @ApiProperty({ required: false})
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  birthdate: Date;

  //telefono
  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsArray()
  categories?: Category[];

  @IsOptional()
  @IsArray()
  appointmentClient?: Appointment[];

  @IsOptional()
  @IsArray()
  detailsAppointmentEmployee?: DetailsAppointment[];

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  role: Role;

  @IsOptional()
  @IsDate()
  created_at: Date;

  @IsOptional()
  @IsDate()
  updated_at: Date;

  @IsOptional()
  @IsDate()
  deleted_at: Date;
}
