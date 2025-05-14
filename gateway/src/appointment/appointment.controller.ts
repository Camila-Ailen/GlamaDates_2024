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
import { IdDTO, ResposeDTO } from '@/base/dto/base.dto';
import { ApiOperation } from '@nestjs/swagger';
import { Appointment } from './entities/appointment.entity';

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

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  @Post('send-confirmation/:id')
  async sendConfirmationEmail(@Param('id') id: number): Promise<ResposeDTO> {
    await this.appointmentService.sendAppointmentConfirmationEmail(id);
    return { status: 'success', data: 'Email enviado correctamente' };
  }

  @Post('send-reminder/:id')
  async sendReminderEmail(@Param('id') id: number): Promise<ResposeDTO> {
    await this.appointmentService.sendAppointmentReminderEmail(id);
    return { status: 'success', data: 'Email de recordatorio enviado correctamente' };
  }

  @Post('send-cancellation/:id')
  async sendCancellationEmail(@Param('id') id: number): Promise<ResposeDTO> {
    await this.appointmentService.sendAppointmentCancellationEmail(id);
    return { status: 'success', data: 'Email de cancelación enviado correctamente' };
  }

  @Post('send-inactive/:id')
  async sendInactiveEmail(@Param('id') id: number): Promise<ResposeDTO> {
    await this.appointmentService.sendAppointmentInactiveEmail(id);
    return { status: 'success', data: 'Email de turno inactivo enviado correctamente' };
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  @Get('user/one/:id')
  // @Auth('read:appointments')
  async one(@Param() params: IdDTO): Promise<ResposeDTO> {
    return {
      status: 'success',
      data: await this.appointmentService.getById(params.id),
    };
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////

  @Patch('updatePendingToInactive')
  @Auth('update:appointments')
  async updatePendingToDelinquent(): Promise<ResposeDTO> {
    await this.appointmentService.updatePendingToInactive();
    return {
      status: 'success',
    };
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  // registro de pago desde en efectivo
  @Patch('registerCashPayment/:id')
  @Auth('update:appointments')
  async registerPayment(
    @Param() params: IdDTO,
    @Body() body: { observation: string },
  ): Promise<ResposeDTO> {
    const appointment = await this.appointmentService.registerCashPayment(params.id, body);
    return {
      status: 'success',
      data: appointment,
    };
  }

  /////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  // Cambiar estado desde el profesional //
  @Get('progressState/:id')
  @Auth('update:appointments')
  async progressState(@Param() params: IdDTO): Promise<ResposeDTO> {
    const appointment = await this.appointmentService.progressState(params.id);
    return {
      status: 'success',
    };
  }

  // Cambiar estado de completado del servicio desde el profesional //
  @Get('complete/:id')
  @Auth('update:completedappointments')
  async complete(@Param() params: IdDTO, @Req() request: { user: User }): Promise<ResposeDTO> {
    const appointment = await this.appointmentService.completedService(params.id, request.user.id);
    return { status: 'success', data: appointment };
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////


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
    return { status: 'success', data: appointments };
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  // Trae los turnos de un usuario para el calendario
  @Get('userDates')
  @Auth('read:mydate-calendar')
  async allByUserDates(@Req() request: { user: User }): Promise<ResposeDTO> {
    const user = request.user;
    const appointments = await this.appointmentService.allByUserDates(user);
    return { status: 'success', data: appointments };
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  // Trae los turnos de un profesional
  @Get('professional')
  @Auth('read:mycalendar')
  async allByProfesional(@Req() request: { user: User }, @Query() query: PaginationAppointmentDto): Promise<ResposeDTO> {
    const user = request.user;
    const appointments = await this.appointmentService.allByProfessional(user, { query });
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
  @Get('isAvailable')
  @Auth('read:availableappointments')
  async checkAvailability(
    @Query('packageId') packageId: number,
    @Query('datetimeStart') datetimeStart: string
  ): Promise<{ available: boolean }> {
    const available = await this.appointmentService.isPackageAssignable(packageId, new Date(datetimeStart));
    return { available };
  }

  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Patch('cancel/:id')
  //@Auth('update:users')
  @ApiOperation({ summary: 'Cancel appointment' })
  async update(
    @Param() params: IdDTO,
    @Body() body: AppointmentDto,
    @Req() request: { appointment: Appointment },
  ): Promise<ResposeDTO> {
    return {
      status: 'success',
      data: await this.appointmentService.cancel({ id: params.id, body }),
    };
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  @Patch('rearrange/:id')
  @Auth('update:appointments')
  async rearrange(
    @Param() params: IdDTO,
    @Body() body: AppointmentDto,
    @Req() request: { appointment: Appointment },
  ): Promise<ResposeDTO> {
    return {
      status: 'success',
      data: await this.appointmentService.rearrange({ id: params.id, body: body }),
    };
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

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  @Get('statistics/allDates')
  @Auth('read:appointments')
  async getDatesStatistics(@Query('begin') begin: string, @Query('end') end: string): Promise<any> {
    const statistics = await this.appointmentService.getDatesStatistics(begin, end);
    return statistics;
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  @Get('statistics/payMethod')
  @Auth('read:appointments')
  async getPayMethodStatistics(@Query('begin') begin: string, @Query('end') end: string): Promise<any> {
    const statistics = await this.appointmentService.getPayMethodStatistics(begin, end);
    return statistics;
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  @Get('statistics/delinquentClient')
  @Auth('read:appointments')
  async getDelinquentClientStatistics(@Query('begin') begin: string, @Query('end') end: string): Promise<any> {
    const statistics = await this.appointmentService.getDelinquentClientStatistics(begin, end);
    return statistics;
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  @Get('statistics/perCategory')
  @Auth('read:appointments')
  async getPerCategoryStatistics(@Query('begin') begin: string, @Query('end') end: string): Promise<any> {
    const statistics = await this.appointmentService.getPerCategoryStatistics(begin, end);
    return statistics;
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  @Get('statistics/perProfessional')
  @Auth('read:appointments')
  async getPerProfessionalStatistics(@Query('begin') begin: string, @Query('end') end: string): Promise<any> {
    const statistics = await this.appointmentService.getPerProfessionalStatistics(begin, end);
    return statistics;
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  @Get('statistics/perDay')
  @Auth('read:appointments')
  async getPerDayStatistics(@Query('begin') begin: string, @Query('end') end: string): Promise<any> {
    const statistics = await this.appointmentService.getPerDayStatistics(begin, end);
    return statistics;
  }


}
