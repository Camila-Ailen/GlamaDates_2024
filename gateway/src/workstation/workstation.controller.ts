import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { WorkstationService } from './workstation.service';
import { WorkstationDto } from './dto/workstation.dto';
import { PaginationWorkstationDto } from './dto/pagination-workstation.dto';
import { ApiOperation } from '@nestjs/swagger';
import { IdDTO, ResposeDTO } from '@/base/dto/base.dto';
import { Auth } from '@/auth/auth.decorator';

@Controller('workstation')
export class WorkstationController {
  constructor(private readonly workstationService: WorkstationService) {}

  @Post()
  @Auth('create:workstation')
  @ApiOperation({ summary: 'Create a new workstation' })
  async create (@Body() body: WorkstationDto): Promise<ResposeDTO> {
    console.log('Creating workstation with body:', body);
    const workstation = await this.workstationService.create({body});
    return { status: 'success', data: workstation };
  }

  @Get()
  @Auth('read:workstation')
  @ApiOperation({ summary: 'Get all workstations' })
  async findAll(@Query() query: PaginationWorkstationDto): Promise<ResposeDTO> {
    const workstations = await this.workstationService.findAll({ query });
    return { status: 'success', data: workstations };
  }

  @Get(':id')
  @Auth('read:workstation')
  @ApiOperation({ summary: 'Get workstation by ID' })
  async getById(@Param() params: IdDTO): Promise<ResposeDTO> {
    const workstation = await this.workstationService.findOne(params.id);
    return { status: 'success', data: workstation };
  }

  @Patch(':id')
  @Auth('update:workstation')
  @ApiOperation({ summary: 'Update workstation by ID' })
  async update(
    @Param() params: IdDTO, 
    @Body() body: WorkstationDto
  ): Promise<ResposeDTO> {
    const updatedWorkstation = await this.workstationService.update(params.id, body);
    return { status: 'success', data: updatedWorkstation };
  }

  @Delete(':id')
  @Auth('delete:workstation')
  @ApiOperation({ summary: 'Delete workstation by ID' })
  async remove(@Param() params: IdDTO): Promise<ResposeDTO> {
    const deletedWorkstation = await this.workstationService.remove(params.id);
    return { status: 'success', data: deletedWorkstation };
  }
}
