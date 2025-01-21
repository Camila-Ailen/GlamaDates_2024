import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Appointment } from "./entities/appointment.entity";
import { Package } from "@/package/entities/package.entity";
import { Between, In, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { add, addMinutes, isAfter, isBefore, isEqual, subMinutes } from "date-fns";
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
import { WorkstationState } from "@/workstation/entities/workstation-state.enum";
import { last } from "rxjs";

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


    // Verifico que hayan servicios en el paquete y los guardo en body.package.services
    if (body.package && body.package.services.length > 0) {
      const service = await this.serviceRepository.find({
        where: {
          id: In(body.package.services.map((service: Service) => service.id)),
        },
      });
      body.package.services = service;
    }

    // Guardo la fecha y horario de la cita
    const appointmentDate = new Date(body.datetimeStart);
    console.log('appointmentDate: ', appointmentDate);

    // Verifico que la fecha y horario de la cita no estén ocupados
    // Primero traigo los datos globales

    const config = await this.configService.getSystemConfig();

    // console.log('body.package.services: ', body.package);

    // debo iterar sobre los servicios del paquete para verificar que existen empleados y estaciones de trabajo
    // for (const service of body.package.services) {
    //   console.log('hasta aca todo bien, verificando ');
    // console.log('service.category.id: ', );
    // const employees = await this.findProffesionalsByCategory(service.category.id, this.userRepository);
    // const employee = employees[0];

    // const workstations = await this.findWorkstations(service.id, this.workstationRepository);
    // const workstation = workstations[0];

    // if (!employee || !workstation) {
    //   throw new HttpException('Employee or Workstation not found', HttpStatus.NOT_FOUND);
    // }

    // Verifico que la fecha y horario de la cita no estén ocupados
    //   const existingAppointments = await this.fetchExistingAppointments(config.maxReservationDays, [service.category.id]);
    //   if (this.hasCollision(appointmentDate, existingAppointments)) {
    //     throw new HttpException('Appointment time is not available', HttpStatus.BAD_REQUEST);
    //   }
    // }

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
    // console.log('savedAppointment: ', savedAppointment);

    console.log('Cantidad de servicios: ', body.package.services.length);



    // debo iterar sobre los servicios del paquete para crear los detalles
    for (const service of body.package.services) {
      console.log('hasta aca todo bien ');
      // const employees = await this.findProffesionals(service.id, this.userRepository);
      // const employee = employees.find(e => !this.findAvailableEmployee(e.id, null, appointmentDate));

      // const employees = await this.findProffesionals(service.id, this.userRepository);
      // const availableEmployee = await this.findAvailableEmployee(employees, appointmentEntity.datetimeStart, appointmentEntity.datetimeEnd);
      // const employee = employees.find(e => e.id === availableEmployee);
      // if (!employee) {
      //   throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
      // }

      const employees = await this.findProffesionals(service.id, this.userRepository);
      const randomIndexEmployee = Math.floor(Math.random() * employees.length);
      const employee = employees[randomIndexEmployee];

      // const workstations = await this.findWorkstations(service.id, this.workstationRepository);
      // const workstation = workstations.find(w => !this.hasAppointments(null, w.id, appointmentDate));

      // const workstations = await this.findWorkstations(service.id, this.workstationRepository);
      // const availableWorkstation = await this.findAvailableWorkstation(workstations, appointmentEntity.datetimeStart, appointmentEntity.datetimeEnd);
      // const workstation = workstations.find(e => e.id === availableWorkstation);
      // if (!workstation) {
      //   throw new HttpException('Workstation not found', HttpStatus.NOT_FOUND);
      // }

      const workstations = await this.findWorkstations(service.id, this.workstationRepository);
      const randomIndexStation = Math.floor(Math.random() * workstations.length);
      const workstation = workstations[randomIndexStation];

      const detail = this.detailsAppointmentRepository.create({
        appointment: savedAppointment,
        service: service,
        priceNow: service.price,
        durationNow: service.duration,
        datetimeStart: appointmentDate,
        employee: employee,
        workstation: workstation,
        createdAt: new Date(),
      });
      // Guardo el detalle
      await this.detailsAppointmentRepository.save(detail);
    }

    return savedAppointment;
  }


  async hasAppointments(id, workstationId, date) {
    const appointments = await this.detailsAppointmentRepository.find({
      where: {
        [id === 'employee.id' ? 'employee.id' : 'workstation.id']: id,
        workstation: workstationId,
        datetimeStart: date
      }
    });
    console.log(`Evaluando para empleado: ${id}, estacion de trabajo: ${workstationId}`);
    console.log('Supongo que pase la busqueda de empleados y estaciones de trabajo con cantidad: ', appointments.length);
    return appointments.length > 0;
  }


  async findAvailableEmployee(employees, start, end) {
    // Convertir los parámetros de fecha a una cadena en formato ISO 8601 (UTC)
    const startISO = start.toISOString();
    const endISO = end.toISOString();

    // Obtener las citas en el rango de horarios especificado

    const appointments = await this.detailsAppointmentRepository.find({
      where: {
        datetimeStart: startISO,
      },
      relations: ['employee'],
    });

    console.log('Ya dentro de la funcion, appointments: ', appointments);
    console.log(`startISO: ${startISO}`);
    console.log(`endISO: ${endISO}`);

    // Crear un objeto para rastrear la disponibilidad de cada empleado
    const employeeAvailability = {};
    employees.forEach((employee) => {
      employeeAvailability[employee.id] = true;
    });

    // Marcar como disponibles los empleados que tienen citas en el rango de horarios
    appointments.forEach((appointment) => {
      if (employeeAvailability[appointment.employee.id]) {
        employeeAvailability[appointment.employee.id] = true;
      }
    });

    // Buscar el primer empleado no disponible
    const availableEmployee = employees.find((employee) => employeeAvailability[employee.id]);

    // Devolver el ID del empleado disponible o null si no se encuentra ninguno
    return availableEmployee ? availableEmployee.id : null;
  }

  async findAvailableWorkstation(workstations, start, end) {
    // Convertir los parámetros de fecha a una cadena en formato ISO 8601 (UTC)
    const startISO = start.toISOString();
    const endISO = end.toISOString();

    // Obtener las citas en el rango de horarios especificado
    const appointments = await this.detailsAppointmentRepository.find({
      where: {
        datetimeStart: startISO,

      },
    });
    console.log('Ya dentro de la funcion, appointments: ', appointments);
    console.log('workstations: ', workstations);
    console.log(`startISO: ${startISO}, endISO: ${endISO}`);

    // Crear un objeto para rastrear la disponibilidad de cada workstation
    const workstationAvailability = {};
    workstations.forEach((workstation) => {
      workstationAvailability[workstation.id] = false;
    });

    // Marcar como disponibles los workstations que tienen citas en el rango de horarios
    appointments.forEach((appointment) => {
      if (!workstationAvailability[appointment.workstation.id]) {
        workstationAvailability[appointment.workstation.id] = true;
      }
    });

    // Buscar el primer workstation no disponible
    const availableWorkstation = workstations.find((workstation) => !workstationAvailability[workstation.id]);

    console.log('availableWorkstation: ', availableWorkstation);

    // Devolver el ID del workstation disponible o null si no se encuentra ninguno
    return availableWorkstation ? availableWorkstation.id : null;
  }


  async getAvailableAppointments3(id: number, page: number, pageSize: number): Promise<any> {
    // obtener la configuracion del sistema
    const config = await this.configService.getSystemConfig();

    // Validar el paquete
    const packageData = await this.validatePackage(id);

    // Generar espacios disponibles
    let availableStartTimes: Date[] = [];
    for (const service of packageData.services) {
      // Obtener las citas existentes en el rango de fechas permitido (para no mostrar turnos en el pasado)
      const existingAppointmentsDetail = await this.detailsAppointmentRepository.find({
        where: {
          workstation: {
            categories: {
              id: service.category.id,
            },
          },
          datetimeStart: Between(new Date(), new Date(new Date().setDate(new Date().getDate() + config.maxReservationDays))),
        },
        relations: ['appointment', 'workstation', 'workstation.categories', 'employee', 'service'],
      });

      // Generar espacios disponibles para el servicio actual
      const availabile = await this.generateAvailableStartTimes2(config, existingAppointmentsDetail, service.category.id, service.duration);
      availableStartTimes.push(...availabile);
    }

    return this.paginateResults(availableStartTimes, page, pageSize);
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

  async findProffesionalsByCategory(serviceCategory: number, userRepository: Repository<User>) {
    const users = await userRepository.createQueryBuilder('user')
      .innerJoin('user.categories', 'category')
      .where('category.id = :categoryId', { categoryId: serviceCategory })
      .andWhere('user.deletedAt IS NULL')
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
      .andWhere('workstation.state = :state', { state: WorkstationState.ACTIVE })
      .andWhere('workstation.deletedAt IS NULL')
      .distinct(true)
      // .limit(1)
      .getMany();

    return workstations;
  }

  async findWorkstationsByCategory(serviceCategory: number, workstationRepository: Repository<Workstation>) {
    const workstations = await workstationRepository.createQueryBuilder('workstation')
      .innerJoin('workstation.categories', 'category')
      .where('category.id = :categoryId', { categoryId: serviceCategory })
      .distinct(true)
      // .limit(1)
      .getMany();

    return workstations;
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


  private async generateAvailableStartTimes2(config: SystemConfig, existingAppointments: DetailsAppointment[], categoryId: number, serviceDuration: number): Promise<Date[]> {
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

    // Obtener profesionales de la categoria
    const professionals = await this.findProffesionalsByCategory(categoryId, this.userRepository)
    // console.log('Profesionales: ', professionals);

    // Obtener estaciones de trabajo de la categoria
    const workstations = await this.findWorkstationsByCategory(categoryId, this.workstationRepository);
    // console.log('Estaciones de trabajo: ', workstations);

    let lastStartTimeHour = closingHour1Hour;
    let lastStartTimeMinute = closingHour1Minute - serviceDuration;

    if (lastStartTimeMinute < 0) {
      lastStartTimeHour -= 1;
      lastStartTimeMinute += 60;
    }

    const lastStartTime = `${lastStartTimeHour.toString().padStart(2, '0')}:${lastStartTimeMinute.toString().padStart(2, '0')}:00`;
    console.log('lastStartTime: ', lastStartTime);
    console.log('maxDateUTC: ', maxDateUTC);
    console.log('currentStartUTC: ', currentStartUTC);


    while ((currentStartUTC < maxDateUTC)) {
      if (this.isValidDayAndTime(currentStartUTC, config, lastStartTime)) {
        // esta validando los horarios en general, sin considerar categorias ni nada, si hay turno en ese horario, no va a devolver bien
        if (!this.hasDetailsCollision(currentStartUTC, existingAppointments)) {
          if (!this.hasFutureCollision(currentStartUTC, existingAppointments, serviceDuration)) {
            if (currentStartUTC.getMinutes() % intervalMinutes === 0) {
              // verifico disponibilidad de empleados y estaciones de trabajo en el horario
              let isAvailable = true;
              for (const appointment of existingAppointments) {
                if (isAfter(currentStartUTC, appointment.datetimeStart) && isBefore(currentStartUTC, addMinutes(appointment.datetimeStart, appointment.durationNow))) {
                  isAvailable = false;
                  break;
                }
              }
              availableStartTimes.push(new Date(currentStartUTC));
            }

          } else {
            console.log(' ');
            console.log('Colisiono a futuro en: ', currentStartUTC);

            if (currentStartUTC.getMinutes() % intervalMinutes === 0) {

              const colisionAppointmentsFuture = await this.colisionAvailableFuture(currentStartUTC, serviceDuration, categoryId);
              // Evaluo si hay cantidad de profesionales y estaciones de trabajo suficientes disponibles
              if (colisionAppointmentsFuture.length < professionals.length && colisionAppointmentsFuture.length < workstations.length) {
                // Como aqui todavia no se deben asignar, con saber que hay disponibles es suficiente
                availableStartTimes.push(new Date(currentStartUTC));
              } else {
                console.log('No hay suficientes turnos disponibles (colision futura)');
              }

            }
          }
        } else {
          console.log(' ');
          console.log('Hay colisión en el horario: ', currentStartUTC);

          if (currentStartUTC.getMinutes() % intervalMinutes === 0) {
            
            // turnos en colision con el horario actual
            const colisionAppointments = await this.colisionAvailable(currentStartUTC, serviceDuration, categoryId);

            // console.log('colisionAppointments cantidad: ', colisionAppointments.length);
            // console.log('profesionales cantidad: ', professionals.length);
            // console.log('estaciones de trabajo cantidad: ', workstations.length);

            // Evaluo si hay cantidad de profesionales y estaciones de trabajo suficientes disponibles
            if (colisionAppointments.length < professionals.length && colisionAppointments.length < workstations.length) {
              // Como aqui todavia no se deben asignar, con saber que hay disponibles es suficiente
              availableStartTimes.push(new Date(currentStartUTC));
            } else {
              console.log('No hay suficientes turnos disponibles (colision presente)');
            }
          }
        }
      }

      currentStartUTC = addMinutes(currentStartUTC, 10);
    }

    return availableStartTimes;
  }


  // tengo que ingresar
  // 1. la fecha y hora actuales (currentStartTime)
  // 2. la duracion del servicio (serviceDuration)
  // 3. la id de la categoria del servicio (category)
  private async colisionAvailable(currentStartTime: Date, serviceDuration: number, category: number) {
    // pasar a un array las citas de la categoria afectadas en el servicio
    console.log('Entre a la funcion colisionAvailable');
    // const existingAppointments = await this.detailsAppointmentRepository.find({
    //   where: [
    //     {
    //       workstation: { categories: { id: category } }
    //     },
    //     {
    //       datetimeStart: 
    //       (Between(currentStartTime, addMinutes(currentStartTime, serviceDuration))) ||

    //       ((LessThanOrEqual(currentStartTime)) && MoreThanOrEqual(subMinutes(currentStartTime, serviceDuration))) ||

    //       ((MoreThanOrEqual(currentStartTime)) && LessThanOrEqual(addMinutes(currentStartTime, serviceDuration))) ||

    //       ((LessThanOrEqual(currentStartTime)) && MoreThanOrEqual(subMinutes(currentStartTime, serviceDuration)))
    //     },
    //   ],
    //   relations: ['workstation', 'workstation.categories'],
    // })

    const existingAppointments = await this.detailsAppointmentRepository
      .createQueryBuilder('detailsAppointment')
      .innerJoin('detailsAppointment.workstation', 'workstation')
      .innerJoin('workstation.categories', 'category')
      .where('category.id = :categoryId', { categoryId: category })
      .andWhere('detailsAppointment.datetimeStart BETWEEN :start AND :end', {
        start: subMinutes(currentStartTime, serviceDuration),
        end: addMinutes(currentStartTime, serviceDuration),
      })
      .getMany();

    return existingAppointments;
  }

  private async colisionAvailableFuture(currentStartTime: Date, serviceDuration: number, category: number) {
    // pasar a un array las citas de la categoria afectadas en el servicio
    console.log('Entre a la funcion colisionAvailableFuture');

    const existingAppointments = await this.detailsAppointmentRepository
      .createQueryBuilder('detailsAppointment')
      .innerJoin('detailsAppointment.workstation', 'workstation')
      .innerJoin('workstation.categories', 'category')
      .where('category.id = :categoryId', { categoryId: category })
      .andWhere('detailsAppointment.datetimeStart BETWEEN :start AND :end', {
        start: subMinutes(currentStartTime, serviceDuration),
        end: addMinutes(currentStartTime, serviceDuration),
      })
      .getMany();

    console.log('existingAppointments en colisionAvailableFuture: ', existingAppointments);


    return existingAppointments;
  }



  private isValidDayAndTime(currentStartTime: Date, config: SystemConfig, lastStartTime: string): boolean {
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
    const closingTime1 = lastStartTime ? this.timeToMinutes(lastStartTime) : null;
    const openingTime2 = openingHour2 ? this.timeToMinutes(openingHour2) : null;
    const closingTime2 = closingHour2 ? this.timeToMinutes(closingHour2) : null;

    // Validamos si está en el primer o segundo turno
    const inFirstShift =
      openingTime1 !== null &&
      closingTime1 !== null &&
      currentTime >= openingTime1 &&
      currentTime <= closingTime1;

    const inSecondShift =
      openingTime2 !== null &&
      closingTime2 !== null &&
      currentTime >= openingTime2 &&
      currentTime <= closingTime2;

    // Retornamos true solo si el día está abierto y el tiempo está dentro de algún turno
    return isOpenDay && (inFirstShift || inSecondShift);
  }

  // Función auxiliar para convertir horas en formato HH:mm a minutos
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }


  // private hasFutureCollision(currentStartTime: Date, existingAppointments: DetailsAppointment[], serviceDuration: number): boolean {
  //   const endTime = addMinutes(currentStartTime, serviceDuration);
  //   return existingAppointments.some(app =>
  //     isBefore(currentStartTime, app.datetimeStart) &&
  //     isAfter(endTime, app.datetimeStart)
  //   );
  // }

  private hasFutureCollision(currentStartTime: Date, existingAppointments: DetailsAppointment[], serviceDuration: number): boolean {
    const endTime = addMinutes(currentStartTime, serviceDuration);
    return existingAppointments.some(app =>
    (isBefore(currentStartTime, app.datetimeStart) &&
      isAfter(endTime, app.datetimeStart))
    );
  }

  // private hasDetailsCollision(currentStartTime: Date, existingAppointments: DetailsAppointment[]): boolean {
  //   return existingAppointments.some(app =>
  //     isBefore(currentStartTime, addMinutes(app.datetimeStart, app.durationNow)) &&
  //     isAfter(addMinutes(currentStartTime, 1), app.datetimeStart)
  //   );
  // }

  private hasDetailsCollision(currentStartTime: Date, existingAppointments: DetailsAppointment[]): boolean {
    return existingAppointments.some(app =>
      (isBefore(currentStartTime, addMinutes(app.datetimeStart, app.durationNow)) &&
        isAfter(addMinutes(currentStartTime, 1), app.datetimeStart)) ||
      (isBefore(currentStartTime, app.datetimeStart) &&
        isAfter(addMinutes(currentStartTime, 1), addMinutes(app.datetimeStart, app.durationNow)))
    );
  }

  private paginateResults(data: Date[], page: number, pageSize: number): Date[] {
    console.log('Entre al paginador');
    if (page < 1 || pageSize < 1) {
      console.log('Entre al if');
      throw new HttpException('Invalid pagination parameters', HttpStatus.BAD_REQUEST);
    }
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }



}
