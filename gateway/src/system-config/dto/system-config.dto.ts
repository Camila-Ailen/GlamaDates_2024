import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsOptional, IsString } from "class-validator";
import { DaysOfWeek } from "../entities/DaysOfWeek.enum";

export class SystemConfigDto {
    @IsOptional()
    id: number;

    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    intervalMinutes: number;

    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    maxReservationDays: number;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    openingHour1: string;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    closingHour1: string;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    openingHour2: string;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    closingHour2: string;

    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    descountFull: number;

    @ApiProperty({ required: false, type: 'number' })
    @IsOptional()
    descountPartial: number;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsEnum(DaysOfWeek, { each: true })
    openDays: DaysOfWeek[];


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
