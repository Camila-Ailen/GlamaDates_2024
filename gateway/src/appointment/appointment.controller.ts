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
  @Auth('read:availableappointments')
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

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  // Trae los turnos, todos
  @Get('today')
  @Auth('read:appointments')
  async allToday(@Query() query: PaginationAppointmentDto): Promise<ResposeDTO> {
    const appointments = await this.appointmentService.allToday({ query });
    console.log('data: ', appointments);
    return { status: 'success', data: appointments };
  }


  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  // Trae los turnos de un usuario
  @Get('user')
  @Auth('read:mydate-calendar')
  async allByUser(@Req() request: { user: User }, @Query() query: PaginationAppointmentDto): Promise<ResposeDTO> {
    const user = request.user;
    const appointments = await this.appointmentService.allByUser(user, { query });
    // console.log('data: ', appointments);
    return { status: 'success', data: appointments };
  }

   ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  // Trae los turnos de un profesional
  @Get('professional')
  @Auth('read:mycalendar')
  async allByProfesional(@Req() request: { user: User }, @Query() query: PaginationAppointmentDto): Promise<ResposeDTO> {
    const user = request.user;
    console.log('user: ', user.id);
    const appointments = await this.appointmentService.allByProfessional(user, { query });
    console.log('data: ', appointments); 
    return { status: 'success', data: appointments };
  }


  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////

  @Post()
  @Auth('create:appointments')
  async create(
    @Req() request: { user: User },
    @Body() appointmentDto: AppointmentDto,
  ) {
    const user = request.user;
    return await this.appointmentService.create(appointmentDto, user);
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////

  @Get('todayCount')
  @Auth('read:appointments')
  async getTodayAppointments(): Promise<{ total_turnos: number }> {
    const totalTurnos = await this.appointmentService.getTodayAppointments();
    return { total_turnos: totalTurnos };
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////

  @Get('thisMonth')
  @Auth('read:appointments')
  async getThisMonthAppointments(): Promise<{ total_turnos: number }> {
    const totalTurnos = await this.appointmentService.getThisMonthAppointments();
    return { total_turnos: totalTurnos };
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////

  @Get('lastMonth')
  @Auth('read:appointments') 
  async getLastMonthAppointments(): Promise<{ total_turnos: number }> {
    const totalTurnos = await this.appointmentService.getLastMonthAppointments();
    return { total_turnos: totalTurnos };
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////

  @Get('week')
  @Auth('read:appointments')
  async getThisWeekAppointments(): Promise<{ total_turnos: number }> {
    const totalTurnos = await this.appointmentService.getThisWeekAppointments();
    return { total_turnos: totalTurnos };
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  @Get('history')
  @Auth('read:appointments')
  async getAppointmentHistory(@Query('range') range: string): Promise<any> {
    const history = await this.appointmentService.getAppointmentHistory(range);
    return history;
  }

  
}
