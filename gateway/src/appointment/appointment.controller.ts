import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, Inject } from '@nestjs/common';
// import { AppointmentService } from './appointment.service';
import { AppointmentDto } from './dto/appointment.dto';
import { PaginationAppointmentDto } from './dto/pagination-appointment.dto';
import { AppointmentService } from './appointment.service';
import { SystemConfigService } from '@/system-config/system-config.service';
import { SystemConfigDto } from '@/system-config/dto/system-config.dto';
import { User } from '@/users/entities/user.entity';
import { Auth } from '@/auth/auth.decorator';
import { JwtService } from '@nestjs/jwt';
import { BaseController } from '@/base/base.controller';
import { ResposeDTO } from '@/base/dto/base.dto';

@Controller('appointment')
export class AppointmentController extends BaseController {
  @Inject(AppointmentService)
  private readonly appointmentService: AppointmentService;
  private jwtService: JwtService;
  @Inject(SystemConfigService)
  private readonly configService: SystemConfigService; // Para verificar parámetros globales

  constructor() {
    super(AppointmentController);
  }

  @Get('open-days')
  async getOpenDays(): Promise<{ openDays: string[] }> {
    const configDto = new SystemConfigDto(); // Create an instance of SystemConfigDto
    const config = await this.configService.getSystemConfig();
    return { openDays: config.openDays };
  }


  // Trae los horarios disponibles para un paquete
  @Get('availability2/:packageId')
  @Auth('read:appointments')
  async getAvailability2(@Param('packageId') packageId: number, @Query('offset') offset: number, @Query('pageSize') pageSize: number): Promise<Date[]> {
    return this.appointmentService.getAvailableAppointments3(packageId, offset, pageSize);
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  // Trae los turnos, todos
  @Get()
  @Auth('read:appointments')
  async all(@Query() query: PaginationAppointmentDto): Promise<ResposeDTO> {
    const appointments = await this.appointmentService.all({ query });
    return { status: 'success', data: appointments };
  }



  @Post()
  @Auth('create:appointments')
  async create(
    @Req() request: { user: User },
    @Body() appointmentDto: AppointmentDto,
  ) {
    const user = request.user;
    return await this.appointmentService.create(appointmentDto, user);
  }


}
