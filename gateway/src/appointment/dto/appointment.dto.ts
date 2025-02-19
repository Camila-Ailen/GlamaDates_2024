
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { AppointmentState } from '../entities/appointment-state.enum';
import { App } from 'supertest/types';
import { User } from '@/users/entities/user.entity';
import { Workstation } from '@/workstation/entities/workstation.entity';
import { Package } from '@/package/entities/package.entity';
import { DetailsAppointment } from '@/details-appointment/entities/details-appointment.entity';
import { Transform } from 'class-transformer';
import { Payment } from '@/payment/entities/payment.entity';
import { DiscountType } from '../entities/discountTypes';

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
    @IsEnum(DiscountType)
    discountType: DiscountType;

    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    total: number;

    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    discount: number;

    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    pending: number;

    @ApiProperty({ required: false, type: 'boolean' })
    @IsOptional()
    advance: boolean;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    client: User; 

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    package: Package; 

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    payments?: Payment[];

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

