import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceDto } from './dto/service.dto';
import { ApiOperation } from '@nestjs/swagger';
import { IdDTO, ResposeDTO } from '@/base/dto/base.dto';
import { Service } from './entities/service.entity';
import { PaginationServiceDto } from './dto/pagination-service.dto';
import { Auth } from '@/auth/auth.decorator';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

    ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Get()
  // @Auth('read:services')
  @ApiOperation({ summary: 'Get all services' })
  async all(@Query() query: PaginationServiceDto): Promise<ResposeDTO> {
    console.log("desde el controlador: ", query);
    const services = await this.serviceService.all({ query });
    return { status: 'success', data: services };
  }

 ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Get(':id')
  @Auth('read:services')
  @ApiOperation({ summary: 'Get Service by ID' })
  async getById(
    @Req() request: { service: Service },
    @Param('id') id: number,
  ): Promise<ResposeDTO> {
    const serviceDto = new ServiceDto();
    serviceDto.id = id;
    const service = await this.serviceService.getBy(serviceDto);
    return { status: 'success', data: service };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Post()
  @Auth('create:services')
  @ApiOperation({ summary: 'Create Service' })
  @Post()
  async create(@Body() body: ServiceDto): Promise<ResposeDTO> {
    console.log("desde el controlador: ", body);
    const service = await this.serviceService.create({ body });
    return { status: 'success', data: service };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Patch(':id')
  @Auth('update:services')
  @ApiOperation({ summary: 'Update Service' })
  async update(
    @Param() params: IdDTO,
    @Body() body: ServiceDto,
    @Req() request: { service: Service },
  ): Promise<ResposeDTO> {
    return {
      status: 'success',
      data: await this.serviceService.update({ id: params.id, body }),
    };
  }
////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Delete(':id')
  @Auth('delete:services')
  @ApiOperation({ summary: 'Delete Service' })
  async delete(@Param() params: IdDTO): Promise<ResposeDTO> {
    const result = await this.serviceService.delete({ id: params.id });
    return { status: 'success', data: result };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
}