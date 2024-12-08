import { Service } from "@/service/entities/service.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsInt, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class PackageDto {
    @IsOptional()
    id: number

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    name: string

    @ApiProperty({ required: false, type: 'string' })
    @IsOptional()
    @IsString()
    description: string

    @ApiProperty({ required: false, type: 'number' })
    //@IsNumber()
    //@IsPositive()
    @IsOptional()
    price: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    services: Service[];

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
