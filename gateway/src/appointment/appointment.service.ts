import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Appointment } from "./entities/appointment.entity";
import { Package } from "@/package/entities/package.entity";
import { Between, In, Repository } from "typeorm";
import { addMinutes, isAfter, isBefore } from "date-fns";
import { Service } from "@/service/entities/service.entity";
import { SystemConfigService } from "@/system-config/system-config.service";
import { SystemConfigDto } from "@/system-config/dto/system-config.dto";
import { SystemConfig } from "@/system-config/entities/system-config.entity";
import { DaysOfWeek } from "@/system-config/entities/DaysOfWeek.enum";
import { AppointmentDto } from "./dto/appointment.dto";
import { User } from "@/users/entities/user.entity";
import { DetailsAppointment } from "@/details-appointment/entities/details-appointment.entity";
import { AppointmentState } from "./entities/appointment-state.enum";
import { Workstation } from "@/workstation/entities/workstation.entity";

@Injectable()
export class AppointmentService {
  employeeRepository: any;
  usersRepository: any;
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Workstation)
    private readonly workstationRepository: Repository<Workstation>,

    @InjectRepository(DetailsAppointment)
    private readonly detailsAppointmentRepository: Repository<DetailsAppointment>,

    private readonly configService: SystemConfigService,
  ) { }

  async create(body: AppointmentDto, user: User): Promise<Appointment> {
    console.log('ESTOY EN EL SERVICIO DE APPOINTMENT');
    // Se pasa a tipo unknown porque sino toma solo al paquete 5
    const pkg = await this.packageRepository.findOne({ where: { id: body.package as unknown as number }, relations: ['services'] });
    body.package = pkg;

    //hallemos los objetos empleado y estacion de trabajo

    // const employee = await this.userRepository.findOne({ where: { id: 5 }, relations: ['detailsAppointmentEmployee'] });
    // console.log('employee: ', employee);
    // const workstation = await this.workstationRepository.findOne({ where: { id: 2 }, relations: ['detailsAppointment'] });
    // console.log('workstation: ', workstation);
    // console.log('body: ', body.package.services);
    // Verifico que hayan servicios en el paquete y los guardo en body.package.services
    if (body.package && body.package.services.length > 0) {
      const service = await this.serviceRepository.find({
        where: {
          id: In(body.package.services.map((service: Service) => service.id)),
        },
      });
      body.package.services = service;
      // console.log('service: ', service);
    }

    // Guardo la fecha y horario de la cita
    const appointmentDate = new Date(body.datetimeStart);

    // Verifico que la fecha y horario de la cita no estén ocupados
    const existingAppointments = await this.fetchExistingAppointments(7, body.package.services.map(service => service.category.id));

    if (this.hasCollision(appointmentDate, existingAppointments)) {
      throw new HttpException('Appointment time is not available', HttpStatus.BAD_REQUEST);
    }

    // Creo la cita
    const appointmentEntity = this.appointmentRepository.create({
      datetimeStart: appointmentDate,
      datetimeEnd: addMinutes(
        appointmentDate,
        body.package.services.reduce((total, service) => total + service.duration, 0)
      ),
      client: user,
      state: AppointmentState.PENDING,
      package: body.package,
    });

    // console.log('appointmentEntity: ', appointmentEntity);
    // Guardo el turno para tener su id
    const savedAppointment = await this.appointmentRepository.save(appointmentEntity);

    console.log('Cantidad de servicios: ', body.package.services.length);
    // debo iterar sobre los servicios del paquete para crear los detalles
    for (const service of body.package.services) {
      console.log('hasta aca todo bien ');
      const employees = await this.findProffesionals(service.id, this.userRepository);
      const employee = employees[0];

      const workstations = await this.findWorkstations(service.id, this.workstationRepository);
      const workstation = workstations[0];

      const detail = this.detailsAppointmentRepository.create({
        appointment: savedAppointment,
        service: service,
        priceNow: service.price,
        durationNow: service.duration,
        employee: employee,
        workstation: workstation,
        createdAt: new Date(),
      });
      // Guardo el detalle
      await this.detailsAppointmentRepository.save(detail);
    }

    return savedAppointment;
  }


  async findProffesionals(serviceId: number, userRepository: Repository<User>) {
    console.log('desde la funcion: serviceId: ', serviceId);
    const service = await this.serviceRepository.findOne({ where: { id: serviceId }, relations: ['category'] });
    if (!service) {
      throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
    }

    const serviceCategory = service.category.id;

    const users = await userRepository.createQueryBuilder('user')
      .innerJoin('user.categories', 'category')
      .where('category.id = :categoryId', { categoryId: serviceCategory })
      .distinct(true)
      // .limit(1)
      .getMany();

    return users;
  }

  async findWorkstations(serviceId: number, workstationRepository: Repository<Workstation>) {
    const service = await this.serviceRepository.findOne({ where: { id: serviceId }, relations: ['category'] });

    if (!service) {
      throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
    }

    const serviceCategory = service.category.id;

    const workstations = await workstationRepository.createQueryBuilder('workstation')
      .innerJoin('workstation.categories', 'category')
      .where('category.id = :categoryId', { categoryId: serviceCategory })
      .distinct(true)
      // .limit(1)
      .getMany();

    return workstations;
  }

  async getAvailableAppointments(id: number, page: number, pageSize: number): Promise<Date[]> {
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
    };

    const config = await this.configService.getSystemConfig(configDto);

    // Validar el paquete
    const packageData = await this.validatePackage(id);


    let existingAppointments: Appointment[] = [];
    for (const service of packageData.services) {
      if (!service) {
        throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
      }

      const categoryIds = packageData.services.map(service => service.category.id);

      // Obtener citas existentes por cada categoria de servicio
      existingAppointments = await this.fetchExistingAppointments(config.maxReservationDays, categoryIds);
    }



    // Generar espacios disponibles
    const availableStartTimes = this.generateAvailableStartTimes(config, existingAppointments);
    console.log('Después de generar espacios disponibles, availableStartTimes: ', availableStartTimes);

  
    // Aplicar paginación
    return this.paginateResults(availableStartTimes, page, pageSize);
  }

  private async validatePackage(id: number): Promise<Package> {
    const packageData = await this.packageRepository.findOne({ where: { id }, relations: ['services', 'services.category'] });
    if (!packageData) {
      throw new HttpException('Package not found', HttpStatus.NOT_FOUND);
    }
    return packageData;
  }

  private async fetchExistingAppointments(
    maxReservationDays: number,
    categoryIds: number[],
  ): Promise<Appointment[]> {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + maxReservationDays);

    return this.appointmentRepository.find({
      where: {
        datetimeStart: Between(today, maxDate),
        package: {
          services: {
            category: {
              id: In(categoryIds),
            },
          },
        },
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
          if (currentStartUTC.getMinutes() % intervalMinutes === 0) {
            availableStartTimes.push(new Date(currentStartUTC));
          }

        }
      }
      currentStartUTC = addMinutes(currentStartUTC, 10);
    }

    return availableStartTimes;
  }

  private isValidDayAndTime(currentStartTime: Date, config: SystemConfig): boolean {
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

  private paginateResults(data: Date[], page: number, pageSize: number): Date[] {
    if (page < 1 || pageSize < 1) {
      throw new HttpException('Invalid pagination parameters', HttpStatus.BAD_REQUEST);
    }
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }

  

}
