import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Appointment } from "./entities/appointment.entity";
import { Package } from "@/package/entities/package.entity";
import { Between, Repository } from "typeorm";
import { addMinutes, isAfter, isBefore } from "date-fns";

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    private readonly configService: ConfigService,
  ) {}

  async getAvailableAppointments(id: number, page: number, pageSize: number): Promise<Date[]> {
    const config = await this.configService.getConfig();

    // Validar el paquete
    const packageData = await this.validatePackage(id);

    // Obtener citas existentes
    const existingAppointments = await this.fetchExistingAppointments(config.maxReservationDays);

    // Generar espacios disponibles
    const availableStartTimes = this.generateAvailableStartTimes(config, existingAppointments);

    // Aplicar paginación
    return this.paginateResults(availableStartTimes, page, pageSize);
  }

  private async validatePackage(id: number): Promise<Package> {
    const packageData = await this.packageRepository.findOne(id, { relations: ['services', 'services.category'] });
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

    const availableStartTimes: Date[] = [];
    let currentStartTime = new Date(today);

    while (isBefore(currentStartTime, maxDate)) {
      if (this.isValidDayAndTime(currentStartTime, config)) {
        if (!this.hasCollision(currentStartTime, existingAppointments)) {
          availableStartTimes.push(new Date(currentStartTime));
        }
      }
      currentStartTime = addMinutes(currentStartTime, intervalMinutes);
    }

    return availableStartTimes;
  }

  private isValidDayAndTime(currentStartTime: Date, config: SystemConfig): boolean {
    const { openDays, openingHour1, closingHour1, openingHour2, closingHour2 } = config;
    const dayOfWeek = currentStartTime.toLocaleString('en', { weekday: 'short' }).toLowerCase();
    const hour = currentStartTime.toTimeString().split(':')[0] + ':' + currentStartTime.toTimeString().split(':')[1];

    const isOpenDay = openDays.includes(dayOfWeek);
    const inFirstShift = openingHour1 && closingHour1 && hour >= openingHour1 && hour < closingHour1;
    const inSecondShift = openingHour2 && closingHour2 && hour >= openingHour2 && hour < closingHour2;

    return isOpenDay && (inFirstShift || inSecondShift);
  }

  private hasCollision(currentStartTime: Date, existingAppointments: Appointment[]): boolean {
    return existingAppointments.some(app =>
      isBefore(currentStartTime, app.datetimeEnd) && isAfter(currentStartTime, app.datetimeStart),
    );
  }

  private paginateResults(data: Date[], page: number, pageSize: number): Date[] {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }
}
