import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
// import { AppointmentService } from './appointment.service';
import { AppointmentDto } from './dto/appointment.dto';
import { PaginationAppointmentDto } from './dto/pagination-appointment.dto';
import { AppointmentService } from './appointment.service';
import { SystemConfigService } from '@/system-config/system-config.service';
import { SystemConfigDto } from '@/system-config/dto/system-config.dto';

@Controller('appointment')
export class AppointmentController {
    constructor(
      private readonly appointmentService: AppointmentService,
      private readonly configService: SystemConfigService, // Para verificar parámetros globales
    ) {}
  
    @Get('open-days')
    async getOpenDays(): Promise<{ openDays: string[] }> {
      const configDto = new SystemConfigDto(); // Create an instance of SystemConfigDto
      const config = await this.configService.getSystemConfig(configDto);
      return { openDays: config.openDays };
    }
  
    @Get('availability/:packageId')
    async getAvailability(@Param('packageId') packageId: number, @Query('page') page: number, @Query('pageSize') pageSize: number): Promise<Date[]> {
      console.log('Entre al controlador de turnos')
      console.log('packageId: ', packageId);
      console.log('page: ', page);
      console.log('pageSize: ', pageSize);
        console.log('Sigo en el controlador de turnos, pero intento salir');
      return this.appointmentService.getAvailableAppointments(packageId, page, pageSize);
    }
}
