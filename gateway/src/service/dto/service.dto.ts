import { Category } from "@/category/entities/category.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInt, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class ServiceDto {
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
    price: number

    @ApiProperty({ required: false, type: 'number' })
    //@IsInt()
    //@IsPositive()
    duration: number

    @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
    category: Category;

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
