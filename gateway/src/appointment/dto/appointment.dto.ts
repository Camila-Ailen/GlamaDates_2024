
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { AppointmentState } from '../entities/appointment-state.enum';
import { App } from 'supertest/types';
import { User } from '@/users/entities/user.entity';
import { Workstation } from '@/workstation/entities/workstation.entity';
import { Package } from '@/package/entities/package.entity';
import { DetailsAppointment } from '@/details-appointment/entities/details-appointment.entity';
import { Transform } from 'class-transformer';

export class AppointmentDto {
    @IsOptional()
    id: number;

    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    datetimeStart: Date;

    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    datetimeEnd: Date;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsEnum(AppointmentState)
    state: AppointmentState;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    client: User; 

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    package: Package; 

    @IsOptional()
    @IsArray()
    details?: DetailsAppointment[];

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
function IsType(arg0: () => DateConstructor): (target: AppointmentDto, propertyKey: "datetimeStart") => void {
    throw new Error('Function not implemented.');
}

