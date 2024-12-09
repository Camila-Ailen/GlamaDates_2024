// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
// // import { AppointmentService } from './appointment.service';
// import { AppointmentDto } from './dto/appointment.dto';
// import { PaginationAppointmentDto } from './dto/pagination-appointment.dto';

// @Controller('appointment')
// export class AppointmentController {
//   constructor(private readonly appointmentService: AppointmentService) {}

//   @Post()
//   create(@Body() createAppointmentDto: AppointmentDto) {
//     return this.appointmentService.create(createAppointmentDto);
//   }

//   @Get()
//   findAll() {
//     return this.appointmentService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.appointmentService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateAppointmentDto: PaginationAppointmentDto) {
//     return this.appointmentService.update(+id, updateAppointmentDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.appointmentService.remove(+id);
//   }
// }
