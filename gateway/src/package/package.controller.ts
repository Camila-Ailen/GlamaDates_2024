import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { IdDTO, ResposeDTO } from '@/base/dto/base.dto';
import { PackageService } from './package.service';
import { PaginationPackageDto } from './dto/pagination-package.dto';
import { Package } from './entities/package.entity';
import { PackageDto } from './dto/package.dto';

@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

    ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Get()
//   @Auth('read:users')
  @ApiOperation({ summary: 'Get all packages' })
  async all(@Query() query: PaginationPackageDto): Promise<ResposeDTO> {
    // console.log("desde el controlador: ", query);
    const packages = await this.packageService.all({ query });
    return { status: 'success', data: packages };
  }

 ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Get(':id')
//  @Auth('read:users')
  @ApiOperation({ summary: 'Get Package by ID' })
  async getById(
    @Req() request: { package: Package },
    @Param('id') id: number,
  ): Promise<ResposeDTO> {
    const packageDto = new PackageDto();
    packageDto.id = id;
    const pkg = await this.packageService.getBy(packageDto);
    return { status: 'success', data: pkg };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Post()
  //@Auth('create:users')
  @ApiOperation({ summary: 'Create Package' })
  @Post()
  async create(@Body() body: PackageDto): Promise<ResposeDTO> {
    console.log("desde el controlador: ", body);
    const pkg = await this.packageService.create({ body });
    return { status: 'success', data: pkg };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Patch(':id')
  //@Auth('update:users')
  @ApiOperation({ summary: 'Update Package' })
  async update(
    @Param() params: IdDTO,
    @Body() body: PackageDto,
    @Req() request: { package: Package },
  ): Promise<ResposeDTO> {
    return {
      status: 'success',
      data: await this.packageService.update({ id: params.id, body }),
    };
  }
////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Delete(':id')
  //@Auth('delete:users')
  @ApiOperation({ summary: 'Delete Package' })
  async delete(@Param() params: IdDTO): Promise<ResposeDTO> {
    const result = await this.packageService.delete({ id: params.id });
    return { status: 'success', data: result };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
}