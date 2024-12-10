import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Appointment } from "./entities/appointment.entity";
import { Package } from "@/package/entities/package.entity";
import { Between, Repository } from "typeorm";
import { addMinutes, isAfter, isBefore } from "date-fns";
import { Service } from "@/service/entities/service.entity";
import { SystemConfigService } from "@/system-config/system-config.service";
import { SystemConfigDto } from "@/system-config/dto/system-config.dto";
import { SystemConfig } from "@/system-config/entities/system-config.entity";
import { DaysOfWeek } from "@/system-config/entities/DaysOfWeek.enum";

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    private readonly configService: SystemConfigService,
  ) {}

  async getAvailableAppointments(id: number, page: number, pageSize: number): Promise<Date[]> {
    console.log('Entre al servicio de turnos')
    console.log('id: ', id);
    const configDto: SystemConfigDto = {
      id: 1,
      intervalMinutes: 0,
      maxReservationsDays: 0,
      openingHour1: "",
      closingHour1: "",
      openingHour2: "",
      closingHour2: "",
      openDays: [],
      created_at: undefined,
      updated_at: undefined,
      deleted_at: undefined
    }; // Replace with appropriate id
    console.log('configDto: ', configDto);

    const config = await this.configService.getSystemConfig(configDto);
    console.log('config: ', config);

    // Validar el paquete
    console.log('Antes de validar el paquete');
    const packageData = await this.validatePackage(id);
    console.log('Después de validar el paquete, packageData: ', packageData);

    // Obtener citas existentes
    console.log('Antes de obtener citas existentes');
    const existingAppointments = await this.fetchExistingAppointments(config.maxReservationDays);
    console.log('Después de obtener citas existentes, existingAppointments: ', existingAppointments);

    // Generar espacios disponibles
    console.log('Antes de generar espacios disponibles');
    const availableStartTimes = this.generateAvailableStartTimes(config, existingAppointments);
    console.log('Después de generar espacios disponibles, availableStartTimes: ', availableStartTimes);

    // Aplicar paginación
    // console.log('Antes de aplicar paginación');
    return availableStartTimes;
  }

  private async validatePackage(id: number): Promise<Package> {
    const packageData = await this.packageRepository.findOne({ where: { id }, relations: ['services', 'services.category'] });
    console.log('Validadndo paquete: ', JSON.stringify(packageData, null, 2));
    if (!packageData) {
      throw new HttpException('Package not found', HttpStatus.NOT_FOUND);
    }
    return packageData;
  }

  private async fetchExistingAppointments(maxReservationDays: number): Promise<Appointment[]> {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + maxReservationDays);

    return this.appointmentRepository.find({
      where: {
        datetimeStart: Between(today, maxDate),
      },
      order: { datetimeStart: 'ASC' },
    });
  }

  private generateAvailableStartTimes(config: SystemConfig, existingAppointments: Appointment[]): Date[] {
    const { intervalMinutes, maxReservationDays, openingHour1, closingHour1, openingHour2, closingHour2, openDays } = config;

    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + maxReservationDays);
    const [closingHour2Hour, closingHour2Minute] = closingHour2 ? closingHour2.split(':').map(Number) : [0, 0];
    const [closingHour1Hour, closingHour1Minute] = closingHour1.split(':').map(Number);
    maxDate.setHours(closingHour2 ? closingHour2Hour : closingHour1Hour, closingHour2 ? closingHour2Minute : closingHour1Minute, 0, 0);

    const availableStartTimes: Date[] = [];
    let currentStartTime = new Date(today);
    let currentStartUTC = new Date(currentStartTime.toISOString());
    const currentMinutes = currentStartUTC.getMinutes();
    const nextMultipleOfTen = Math.ceil(currentMinutes / 10) * 10;
    currentStartUTC.setMinutes(nextMultipleOfTen, 0, 0); // Redondear al próximo múltiplo de 10
    
    const maxDateUTC = new Date(maxDate.toISOString());


    while (currentStartUTC <= maxDateUTC) {
      if (this.isValidDayAndTime(currentStartUTC, config)) {
        if (!this.hasCollision(currentStartUTC, existingAppointments)) {
          if  (currentStartUTC.getMinutes() % intervalMinutes === 0) {
            availableStartTimes.push(new Date(currentStartUTC));
          }
          
        }
      }
      currentStartUTC = addMinutes(currentStartUTC, 10);
    }

    return availableStartTimes; 
  }

  private isValidDayAndTime(currentStartTime: Date, config: SystemConfig): boolean {
    console.log('Dentro de isValidDayAndTime');
    const { openDays, openingHour1, closingHour1, openingHour2, closingHour2 } = config;
  
    const daysOfWeekArray = [
      DaysOfWeek.DOMINGO,
      DaysOfWeek.LUNES,
      DaysOfWeek.MARTES,
      DaysOfWeek.MIERCOLES,
      DaysOfWeek.JUEVES,
      DaysOfWeek.VIERNES,
      DaysOfWeek.SABADO,
    ];
    
    // Obtenemos el día de la semana como un valor del enum
    const dayOfWeek = daysOfWeekArray[currentStartTime.getDay()]; // Devuelve el enum correspondiente
    
  
    // Validamos si el día está dentro de los días de apertura
    const isOpenDay = openDays.includes(dayOfWeek);
  
    // Convertimos las horas de apertura y cierre a objetos Date para comparaciones precisas
    const currentTime = currentStartTime.getHours() * 60 + currentStartTime.getMinutes(); // Hora en minutos
    const openingTime1 = openingHour1 ? this.timeToMinutes(openingHour1) : null;
    const closingTime1 = closingHour1 ? this.timeToMinutes(closingHour1) : null;
    const openingTime2 = openingHour2 ? this.timeToMinutes(openingHour2) : null;
    const closingTime2 = closingHour2 ? this.timeToMinutes(closingHour2) : null;
  
    // Validamos si está en el primer o segundo turno
    const inFirstShift = 
      openingTime1 !== null && 
      closingTime1 !== null &&
      currentTime >= openingTime1 && 
      currentTime < closingTime1;
  
    const inSecondShift = 
      openingTime2 !== null && 
      closingTime2 !== null &&
      currentTime >= openingTime2 && 
      currentTime < closingTime2;
  
    // Retornamos true solo si el día está abierto y el tiempo está dentro de algún turno
    return isOpenDay && (inFirstShift || inSecondShift);
  }
  
  // Función auxiliar para convertir horas en formato HH:mm a minutos
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private hasCollision(currentStartTime: Date, existingAppointments: Appointment[]): boolean {
    return existingAppointments.some(app =>
      isBefore(currentStartTime, app.datetimeEnd) && isAfter(currentStartTime, app.datetimeStart),
    );
  }

  // private paginateResults(data: Date[], page: number, pageSize: number): Date[] {
  //   page = page || 1;
  //   pageSize = pageSize || 10;
  //   console.log('Dentro de paginateResults');
  //   console.log('data: ', data);
  //   console.log('page: ', page);
  //   console.log('pageSize: ', pageSize);
  //   const start = (page - 1) * pageSize;
  //   const end = start + pageSize;
  //   return data.slice(start, end);
  // }
}
