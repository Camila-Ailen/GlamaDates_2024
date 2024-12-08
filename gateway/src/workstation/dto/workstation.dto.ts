import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from "class-validator";
import { Workstation } from "../entities/workstation.entity";
import { WorkstationState } from "../entities/workstation-state.enum";
import { Category } from "@/category/entities/category.entity";

export class WorkstationDto {
    @IsOptional()
    id: number;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    name: string;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsEnum(WorkstationState)
    state: WorkstationState;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    categories: Category[];


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
