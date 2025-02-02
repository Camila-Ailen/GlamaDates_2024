import { Transform } from "class-transformer";
import { IsDate, IsEnum, IsOptional, IsString } from "class-validator";
import { PaymentMethod } from "../entities/payment-method.enum";
import { PaymentType } from "../entities/payment-type.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Appointment } from "@/appointment/entities/appointment.entity";
import { PaymentStatus } from "../entities/payment-status.enum";


export class PaymentDto {
    @IsOptional()
    id: number;

    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    datetime: Date;

    @IsOptional()
    amount: number;

    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsOptional()
    @IsEnum(PaymentType)
    paymentType: PaymentType;

    @IsOptional()
    @IsEnum(PaymentStatus)
    status: PaymentStatus;

    @IsOptional()
    @IsString()
    observation: string;

    @IsOptional()
    @IsString()
    transactionId: string;

    @IsOptional()
    @IsString()
    paymentURL: string;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    appointment: Appointment;


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