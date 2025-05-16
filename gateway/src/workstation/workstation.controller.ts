import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkstationService } from './workstation.service';
import { WorkstationDto } from './dto/workstation.dto';
import { PaginationWorkstationDto } from './dto/pagination-workstation.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ResposeDTO } from '@/base/dto/base.dto';

@Controller('workstation')
export class WorkstationController {
  constructor(private readonly workstationService: WorkstationService) {}

  @Post()
  create(@Body() createWorkstationDto: WorkstationDto) {
    return this.workstationService.create(createWorkstationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workstations' })
  async findAll(): Promise<ResposeDTO> {
    const workstations = await this.workstationService.findAll();
    return { status: 'success', data: workstations };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workstationService.findOne(+id);
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
