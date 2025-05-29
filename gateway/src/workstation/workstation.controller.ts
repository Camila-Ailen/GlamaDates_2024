import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { WorkstationService } from './workstation.service';
import { WorkstationDto } from './dto/workstation.dto';
import { PaginationWorkstationDto } from './dto/pagination-workstation.dto';
import { ApiOperation } from '@nestjs/swagger';
import { IdDTO, ResposeDTO } from '@/base/dto/base.dto';

@Controller('workstation')
export class WorkstationController {
  constructor(private readonly workstationService: WorkstationService) {}

  @Post()
  create(@Body() createWorkstationDto: WorkstationDto) {
    return this.workstationService.create(createWorkstationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workstations' })
  async findAll(@Query() query: PaginationWorkstationDto): Promise<ResposeDTO> {
    const workstations = await this.workstationService.findAll();
    return { status: 'success', data: workstations };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workstation by ID' })
  async getById(@Param() params: IdDTO): Promise<ResposeDTO> {
    const workstation = await this.workstationService.findOne(params.id);
    return { status: 'success', data: workstation };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkstationDto: PaginationWorkstationDto) {
    return this.workstationService.update(+id, updateWorkstationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workstationService.remove(+id);
  }
}
