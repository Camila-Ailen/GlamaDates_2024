import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetailsAppointmentService } from './details-appointment.service';
import { CreateDetailsAppointmentDto } from './dto/details-appointment.dto';
import { UpdateDetailsAppointmentDto } from './dto/pagination-details-appointment.dto';

@Controller('details-appointment')
export class DetailsAppointmentController {
  constructor(private readonly detailsAppointmentService: DetailsAppointmentService) {}

  @Post()
  create(@Body() createDetailsAppointmentDto: CreateDetailsAppointmentDto) {
    return this.detailsAppointmentService.create(createDetailsAppointmentDto);
  }

  @Get()
  findAll() {
    return this.detailsAppointmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detailsAppointmentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetailsAppointmentDto: UpdateDetailsAppointmentDto) {
    return this.detailsAppointmentService.update(+id, updateDetailsAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detailsAppointmentService.remove(+id);
  }
}
