
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { AppointmentState } from '../entities/appointment-state.enum';
import { App } from 'supertest/types';
import { User } from '@/users/entities/user.entity';
import { Workstation } from '@/workstation/entities/workstation.entity';
import { Package } from '@/package/entities/package.entity';

export class AppointmentDto {
    @IsOptional()
    id: number;

    @IsOptional()
    @IsDate()
    datetimeStart: Date;

    @IsOptional()
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
    employee: User; 

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    workstation: Workstation; 

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    package: Package; 

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
