
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { App } from 'supertest/types';
import { User } from '@/users/entities/user.entity';
import { Workstation } from '@/workstation/entities/workstation.entity';
import { Package } from '@/package/entities/package.entity';
import { Service } from '@/service/entities/service.entity';
import { Appointment } from '@/appointment/entities/appointment.entity';

export class DetailsAppointmentDto {
    @IsOptional()
    id: number;

    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    priceNow: number;

    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    durationNow: number;

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
