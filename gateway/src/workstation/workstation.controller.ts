import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkstationService } from './workstation.service';
import { WorkstationDto } from './dto/workstation.dto';
import { PaginationWorkstationDto } from './dto/pagination-workstation.dto';

@Controller('workstation')
export class WorkstationController {
  constructor(private readonly workstationService: WorkstationService) {}

  @Post()
  create(@Body() createWorkstationDto: WorkstationDto) {
    return this.workstationService.create(createWorkstationDto);
  }

  @Get()
  findAll() {
    return this.workstationService.findAll();
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
