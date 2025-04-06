
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { App } from 'supertest/types';
import { User } from '@/users/entities/user.entity';
import { Workstation } from '@/workstation/entities/workstation.entity';
import { Package } from '@/package/entities/package.entity';
import { Service } from '@/service/entities/service.entity';
import { Appointment } from '@/appointment/entities/appointment.entity';
import { Transform } from 'class-transformer';

export class DetailsAppointmentDto {
    @IsOptional()
    id: number;

    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    priceNow: number;

    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    durationNow: number;

    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    datetimeStart: Date;

    @ApiProperty({ required: false, type: 'boolean' })
    @IsOptional()
    @IsBoolean()
    isCompleted: boolean;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    appointment: Appointment;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    employee: User; 

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    workstation: Workstation; 

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    service: Service; 

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
