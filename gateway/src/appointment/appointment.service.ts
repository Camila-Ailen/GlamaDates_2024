import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Appointment } from "./entities/appointment.entity";
import { Package } from "@/package/entities/package.entity";
import { Between, In, Repository } from "typeorm";
import { add, addMinutes, isAfter, isBefore, isEqual } from "date-fns";
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


    // traer citas ocuapdas basado en cada estacion de trabajo
    // const existingAppointmentsDetail = await this.detailsAppointmentRepository.find({
    //   where: {
    //     workstation: {
    //       categories: {
    //         id: In(packageData.services.map(service => service.category.id)),
    //       },
    //     },
    //     datetimeStart: Between(new Date(), new Date(new Date().setDate(new Date().getDate() + config.maxReservationDays))),
    //   },
    //   relations: ['workstation', 'workstation.categories'],
    // });
    // console.log('existingAppointmentsWorkstation: ', existingAppointmentsDetail);

    // Generar espacios disponibles
    let availableStartTimes: Date[] = [];
    for (const service of packageData.services) {
      console.log('vuelta para la categoria: ', service.category.id);

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

      const availabile = await this.generateAvailableStartTimes2(config, existingAppointmentsDetail, service.category.id, service.duration);
      // console.log('availabile: ', availabile);
      availableStartTimes.push(...availabile);
    }
    // console.log('Después de generar espacios disponibles, availableStartTimes: ', availableStartTimes);


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

  // async getAvailableAppointments(id: number, page: number, pageSize: number): Promise<Date[]> {

  //   const config = await this.configService.getSystemConfig();

  //   // Validar el paquete
  //   const packageData = await this.validatePackage(id);


  //   let existingAppointments: Appointment[] = [];
  //   for (const service of packageData.services) {
  //     if (!service) {
  //       throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
  //     }

  //     const categoryIds = packageData.services.map(service => service.category.id);

  //     // Obtener citas existentes por cada categoria de servicio
  //     existingAppointments = await this.fetchExistingAppointments(config.maxReservationDays, categoryIds);
  //   }
  //   console.log('categoryId: ', packageData.services.map(service => service.category.id));
  //   console.log('existingAppointments: ', existingAppointments);



  //   // Generar espacios disponibles
  //   const availableStartTimes = this.generateAvailableStartTimes(config, existingAppointments, packageData.services[0].category.id);
  //   console.log('Después de generar espacios disponibles, availableStartTimes: ', availableStartTimes);


  //   // Aplicar paginación
  //   return this.paginateResults(await availableStartTimes, page, pageSize);
  // }

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


  // async getAvailableAppointments2(id: number, page: number, pageSize: number): Promise<any> {
  //   // obetener la configuracion del sistema
  //   const config = await this.configService.getSystemConfig();

  //   // Validar el paquete
  //   const packageData = await this.validatePackage(id);

  //   // console.log('packageData2: ', packageData);

  //   // por cada servicio obtener estaciones de trabajo que satisfagan las categorias de cada servicio y las citas existentes
  //   const workstations = await this.workstationRepository.find({
  //     where: {
  //       categories: {
  //         id: In(packageData.services.map(service => service.category.id)),
  //       },
  //       // verifica que la estacion a traer este activa
  //       state: WorkstationState.ACTIVE,
  //     },
  //     relations: ['categories', 'detailsAppointment'],
  //   });

  //   if (!workstations) {
  //     throw new HttpException('Workstations not found', HttpStatus.NOT_FOUND);
  //   }
  //   console.log('workstations: ', workstations);

  //   // por cada servicio obtener los empleados que satisfagan las categorias de cada servicio
  //   const employees = await this.userRepository.find({
  //     where: {
  //       categories: {
  //         id: In(packageData.services.map(service => service.category.id)),
  //       },
  //     },
  //   });

  //   if (!employees) {
  //     throw new HttpException('Employees not found', HttpStatus.NOT_FOUND);
  //   }
  //   // console.log('employees: ', employees);


  //   // traer citas de cada estacion de trabajo
  //   const existingAppointmentsWorkstation = await this.detailsAppointmentRepository.find({
  //     where: {
  //       workstation: {
  //         categories: {
  //           id: In(packageData.services.map(service => service.category.id)),
  //         },
  //       },
  //       datetimeStart: Between(new Date(), new Date(new Date().setDate(new Date().getDate() + config.maxReservationDays))),
  //     },
  //     relations: ['workstation', 'workstation.categories'],
  //   });
  //   console.log('existingAppointmentsWorkstation: ', existingAppointmentsWorkstation);

  //   // traer citas de cada empleado
  //   const existingAppointmentsEmployee = await this.detailsAppointmentRepository.find({
  //     where: {
  //       employee: {
  //         categories: {
  //           id: In(packageData.services.map(service => service.category.id)),
  //         },
  //       },
  //       datetimeStart: Between(new Date(), new Date(new Date().setDate(new Date().getDate() + config.maxReservationDays))),
  //     },
  //     relations: ['employee', 'employee.categories'],
  //   });
  //   console.log('existingAppointmentsEmployee: ', existingAppointmentsEmployee);


  //   // Obtener tiempos disponibles por cada estacion de trabajo de cada servicio
  //   // const availableStartTimes = [];
  //   // for (const workstation of workstations) {
  //   //   console.log('workstation.detailsAppointment: ', workstation.detailsAppointment);
  //   //   // const availableStartTimesForWorkstation = this.generateAvailableStartTimes(config, workstation.detailsAppointment, );
  //   //   // availableStartTimes.push(...availableStartTimesForWorkstation);
  //   // }
  //   // console.log('availableStartTimes: ', availableStartTimes);

  //   /////////////////////////////////////////////////////////////////////////////////

  //   let existingAppointments: Appointment[] = [];
  //   for (const workstation of workstations) {
  //     if (!workstation) {
  //       throw new HttpException('workstation not found', HttpStatus.NOT_FOUND);
  //     }

  //     const categoryIds = workstation.categories.map(category => category.id);

  //     console.log('categoryIds: ', categoryIds);

  //     // Obtener citas existentes por cada workstation
  //     existingAppointments = await this.fetchExistingAppointments(config.maxReservationDays, categoryIds);
  //   }
  //   console.log('existingAppointments: ', existingAppointments);

  //   // Generar espacios disponibles
  //   let availableStartTimes: Date[] = [];
  //   for (const workstation of workstations) {
  //     const availabile = await this.generateAvailableStartTimes(config, existingAppointments, workstation.categories[0].id);
  //     console.log('availabile: ', availabile);
  //     availableStartTimes.push(...availabile);
  //   }
  //   console.log('Después de generar espacios disponibles, availableStartTimes: ', availableStartTimes);

  //   return this.paginateResults(availableStartTimes, page, pageSize);
  // }

  // private async generateAvailableStartTimes(config: SystemConfig, existingAppointments: DetailsAppointment[], categoryId: number): Promise<Date[]> {
  //   const { intervalMinutes, maxReservationDays, openingHour1, closingHour1, openingHour2, closingHour2, openDays } = config;

  //   const today = new Date();
  //   const maxDate = new Date();
  //   maxDate.setDate(today.getDate() + maxReservationDays);
  //   const [closingHour2Hour, closingHour2Minute] = closingHour2 ? closingHour2.split(':').map(Number) : [0, 0];
  //   const [closingHour1Hour, closingHour1Minute] = closingHour1.split(':').map(Number);
  //   maxDate.setHours(closingHour2 ? closingHour2Hour : closingHour1Hour, closingHour2 ? closingHour2Minute : closingHour1Minute, 0, 0);

  //   const availableStartTimes: Date[] = [];
  //   let currentStartTime = new Date(today);
  //   let currentStartUTC = new Date(currentStartTime.toISOString());
  //   const currentMinutes = currentStartUTC.getMinutes();
  //   const nextMultipleOfTen = Math.ceil(currentMinutes / 10) * 10;
  //   currentStartUTC.setMinutes(nextMultipleOfTen, 0, 0); // Redondear al próximo múltiplo de 10

  //   const maxDateUTC = new Date(maxDate.toISOString());

  //   // Obtener profesionales de la categoria
  //   const professionals = await this.findProffesionalsByCategory(categoryId, this.userRepository)
  //   console.log('Profesionales: ', professionals);

  //   // Obtener estaciones de trabajo de la categoria
  //   const workstations = await this.findWorkstationsByCategory(categoryId, this.workstationRepository);
  //   console.log('Estaciones de trabajo: ', workstations);



  //   while (currentStartUTC <= maxDateUTC) {
  //     if (this.isValidDayAndTime(currentStartUTC, config)) {
  //       if (!this.hasCollision(currentStartUTC, existingAppointments)) {
  //         if (currentStartUTC.getMinutes() % intervalMinutes === 0) {
  //           // verifico disponibilidad de empleados y estaciones de trabajo en el horario
  //           let isAvailable = true;
  //           for (const appointment of existingAppointments) {
  //             if (isAfter(currentStartUTC, appointment.datetimeStart) && isBefore(currentStartUTC, appointment.datetimeEnd)) {
  //               isAvailable = false;
  //               break;
  //             }
  //           }


  //           if (isAvailable) {
  //             // Verifico disponibilidad de empleados y estaciones de trabajo en el horario
  //             const isAvailableForProfessionals = professionals.every(professional => {
  //               return !existingAppointments.some(appointment =>
  //                 appointment.details.some(detail =>
  //                   detail.employee.id === professional.id &&
  //                   isAfter(currentStartUTC, detail.datetimeStart) &&
  //                   isBefore(currentStartUTC, appointment.datetimeEnd)
  //                 )
  //               );
  //             });



  //             const isAvailableForWorkstations = workstations.every(workstation => {
  //               return !existingAppointments.some(appointment =>
  //                 appointment.details.some(detail =>
  //                   detail.workstation.id === workstation.id &&
  //                   isAfter(currentStartUTC, detail.datetimeStart) &&
  //                   isBefore(currentStartUTC, appointment.datetimeEnd)
  //                 )
  //               );
  //             });

  //             console.log('isAvailableForProfessionals: ', isAvailableForProfessionals);
  //             console.log('isAvailableForWorkstations: ', isAvailableForWorkstations);

  //             if (isAvailableForProfessionals && isAvailableForWorkstations) {
  //               availableStartTimes.push(new Date(currentStartUTC));
  //             }
  //           }
  //           // availableStartTimes.push(new Date(currentStartUTC));
  //         }

  //       }
  //     }
  //     currentStartUTC = addMinutes(currentStartUTC, 10);
  //   }

  //   return availableStartTimes;
  // }


  /////////////////////////////////////////////////////////////////////////////
  // LA FUNCION QUE ME PUEDE SALVAR PARA VOLVER ATRAS //
  /////////////////////////////////////////////////////////////////////////////
  // private async generateAvailableStartTimes(config: SystemConfig, existingAppointments: Appointment[], categoryId: number): Promise<Date[]> {
  //   const { intervalMinutes, maxReservationDays, openingHour1, closingHour1, openingHour2, closingHour2, openDays } = config;

  //   const today = new Date();
  //   const maxDate = new Date();
  //   maxDate.setDate(today.getDate() + maxReservationDays);
  //   const [closingHour2Hour, closingHour2Minute] = closingHour2 ? closingHour2.split(':').map(Number) : [0, 0];
  //   const [closingHour1Hour, closingHour1Minute] = closingHour1.split(':').map(Number);
  //   maxDate.setHours(closingHour2 ? closingHour2Hour : closingHour1Hour, closingHour2 ? closingHour2Minute : closingHour1Minute, 0, 0);

  //   const availableStartTimes: Date[] = [];
  //   let currentStartTime = new Date(today);
  //   let currentStartUTC = new Date(currentStartTime.toISOString());
  //   const currentMinutes = currentStartUTC.getMinutes();
  //   const nextMultipleOfTen = Math.ceil(currentMinutes / 10) * 10;
  //   currentStartUTC.setMinutes(nextMultipleOfTen, 0, 0); // Redondear al próximo múltiplo de 10

  //   const maxDateUTC = new Date(maxDate.toISOString());

  //   // Obtener profesionales de la categoria
  //   const professionals = await this.findProffesionalsByCategory(categoryId, this.userRepository)
  //   console.log('Profesionales: ', professionals);

  //   // Obtener estaciones de trabajo de la categoria
  //   const workstations = await this.findWorkstationsByCategory(categoryId, this.workstationRepository);
  //   console.log('Estaciones de trabajo: ', workstations);



  //   while (currentStartUTC < maxDateUTC) {
  //     if (this.isValidDayAndTime(currentStartUTC, config)) {
  //       if (!this.hasDetailsCollision(currentStartUTC, existingAppointments)) {
  //         if (currentStartUTC.getMinutes() % intervalMinutes === 0) {
  //           // verifico disponibilidad de empleados y estaciones de trabajo en el horario
  //           let isAvailable = true;
  //           for (const appointment of existingAppointments) {
  //             if (isAfter(currentStartUTC, appointment.datetimeStart) && isBefore(currentStartUTC, appointment.datetimeEnd)) {
  //               isAvailable = false;
  //               break;
  //             }
  //           }


  //           // if (isAvailable) {
  //           //   // Verifico disponibilidad de empleados y estaciones de trabajo en el horario
  //           //   const isAvailableForProfessionals = professionals.every(professional => {
  //           //     return !existingAppointments.some(appointment =>
  //           //       appointment.details.some(detail =>
  //           //         detail.employee.id === professional.id &&
  //           //         isAfter(currentStartUTC, detail.datetimeStart) &&
  //           //         isBefore(currentStartUTC, appointment.datetimeEnd)
  //           //       )
  //           //     );
  //           //   });



  //             // const isAvailableForWorkstations = workstations.every(workstation => {
  //             //   return !existingAppointments.some(appointment =>
  //             //     appointment.details.some(detail =>
  //             //       detail.workstation.id === workstation.id &&
  //             //       isAfter(currentStartUTC, detail.datetimeStart) &&
  //             //       isBefore(currentStartUTC, appointment.datetimeEnd)
  //             //     )
  //             //   );
  //             // });

  //             // console.log('isAvailableForProfessionals: ', isAvailableForProfessionals);
  //             // console.log('isAvailableForWorkstations: ', isAvailableForWorkstations);

  //             // if (isAvailableForProfessionals && isAvailableForWorkstations) {
  //               availableStartTimes.push(new Date(currentStartUTC));
  //             // }
  //           // }
  //           // availableStartTimes.push(new Date(currentStartUTC));
  //         }

  //       }
  //     }
  //     currentStartUTC = addMinutes(currentStartUTC, 10);
  //   }

  //   return availableStartTimes;
  // }

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



    while (currentStartUTC < maxDateUTC) {
      if (this.isValidDayAndTime(currentStartUTC, config)) {
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

              // // Verifico disponibilidad de empleados y estaciones de trabajo en el horario
              // const isAvailableForProfessionals = professionals.some(professional => {
              //   return !existingAppointments.some(appointment =>
              //     appointment.employee?.id === professional.id &&
              //     // isAfter(currentStartUTC, appointment.datetimeStart) &&
              //     (isBefore(currentStartUTC, appointment.datetimeStart) || isEqual(currentStartUTC, appointment.datetimeStart)) &&
              //     isAfter(addMinutes(currentStartUTC, 1), appointment.datetimeStart) &&
              //     isBefore(currentStartUTC, addMinutes(appointment.datetimeStart, appointment.durationNow))
              //   );
              // });


              // const isAvailableForWorkstations = workstations.some(workstation => {
              //   return !existingAppointments.some(appointment =>
              //     appointment.workstation?.id === workstation.id &&
              //     // isAfter(currentStartUTC, appointment.datetimeStart) &&
              //     (isBefore(currentStartUTC, appointment.datetimeStart) || isEqual(currentStartUTC, appointment.datetimeStart)) &&
              //     isAfter(addMinutes(currentStartUTC, 1), appointment.datetimeStart) &&
              //     isBefore(currentStartUTC, addMinutes(appointment.datetimeStart, appointment.durationNow))
              //   );
              // });


              // Verifico disponibilidad de empleados y estaciones de trabajo en el horario
              const isAvailableForProfessionals = professionals.some(professional => {
                console.log(`Verificando profesional ${professional.id}`);
                return !existingAppointments.some(appointment => {
                  console.log(`  Verificando appointment ${appointment.id} con profesional ${appointment.employee?.id}`);
                  const isSameProfessional = appointment.employee?.id === professional.id;
                  console.log(`    Es el mismo profesional: ${isSameProfessional}`);
                  const isBeforeOrEqual = isBefore(currentStartUTC, appointment.datetimeStart) || isEqual(currentStartUTC, appointment.datetimeStart);
                  console.log(`    Es antes o igual al horario actual: ${isBeforeOrEqual}`);
                  // const isAfterOrEqual = isAfter(addMinutes(currentStartUTC, intervalMinutes), appointment.datetimeStart) || isEqual(addMinutes(currentStartUTC, intervalMinutes), appointment.datetimeStart);
                  // console.log(`    Es después o igual al horario actual + intervalo: ${isAfterOrEqual}`);
                  const result = isSameProfessional && (isBeforeOrEqual);
                  console.log(`    Resultado: ${result}`);
                  return result;
                });
              });

              const isAvailableForWorkstations = workstations.some(workstation => {
                console.log(`Verificando workstation ${workstation.id}`);
                return !existingAppointments.some(appointment => {
                  console.log(`  Verificando appointment ${appointment.id} en workstation ${appointment.workstation?.id}`);
                  const isSameWorkstation = appointment.workstation?.id === workstation.id;
                  console.log(`    Es el mismo workstation: ${isSameWorkstation}`);
                  const isBeforeOrEqual = isBefore(currentStartUTC, appointment.datetimeStart) || isEqual(currentStartUTC, appointment.datetimeStart);
                  console.log(`    Es antes o igual al horario actual: ${isBeforeOrEqual}`);
                  // const isAfterOrEqual = isAfter(addMinutes(currentStartUTC, intervalMinutes), appointment.datetimeStart) || isEqual(addMinutes(currentStartUTC, intervalMinutes), appointment.datetimeStart);
                  // console.log(`    Es después o igual al horario actual + intervalo (${intervalMinutes}): ${isAfterOrEqual}`);
                  const result = isSameWorkstation && (isBeforeOrEqual);
                  console.log(`    Resultado: ${result}`);
                  return result;
                });
              });

              if (isAvailableForProfessionals && isAvailableForWorkstations) {
                console.log('Disponible en: ', currentStartUTC);
                availableStartTimes.push(new Date(currentStartUTC));
              }
            }
          }
        } else {
          console.log('Hay colisión en el horario: ', currentStartUTC);

          if (currentStartUTC.getMinutes() % intervalMinutes === 0) {
            // Verifico disponibilidad de empleados y estaciones de trabajo en el horario
            const isAvailableForProfessionals = professionals.some(professional => {
              console.log(`Verificando profesional ${professional.id}`);
              return !existingAppointments.some(appointment => {
                console.log(`  Verificando appointment ${appointment.id} con profesional ${appointment.employee?.id}`);
                const isSameProfessional = appointment.employee?.id === professional.id;
                console.log(`    Es el mismo profesional: ${isSameProfessional}`);
                // const isBeforeOrEqual = isBefore(currentStartUTC, appointment.datetimeStart) || isEqual(currentStartUTC, appointment.datetimeStart);
                // console.log(`    Es antes o igual al horario actual (${currentStartUTC}): ${isBeforeOrEqual}`);
                const isAfterOrEqual = isAfter(addMinutes(currentStartUTC, intervalMinutes), appointment.datetimeStart) || isEqual(addMinutes(currentStartUTC, intervalMinutes), appointment.datetimeStart);
                console.log(`    Es después o igual al horario actual + intervalo: ${isAfterOrEqual}`);
                const result = isSameProfessional && (isAfterOrEqual);
                console.log(`    Resultado: ${result}`);
                return result;
              });
            });

            const isAvailableForWorkstations = workstations.some(workstation => {
              console.log(`Verificando workstation ${workstation.id}`);
              return !existingAppointments.some(appointment => {
                console.log(`  Verificando appointment ${appointment.id} en workstation ${appointment.workstation?.id}`);
                const isSameWorkstation = appointment.workstation?.id === workstation.id;
                console.log(`    Es el mismo workstation: ${isSameWorkstation}`);
                // const isBeforeOrEqual = isBefore(currentStartUTC, appointment.datetimeStart) || isEqual(currentStartUTC, appointment.datetimeStart);
                // console.log(`    Es antes o igual al horario actual (${appointment.datetimeStart}): ${isBeforeOrEqual}`);
                const isAfterOrEqual = isAfter(addMinutes(currentStartUTC, intervalMinutes), appointment.datetimeStart) || isEqual(addMinutes(currentStartUTC, intervalMinutes), appointment.datetimeStart);
                console.log(`    Es después o igual al horario actual + intervalo: ${isAfterOrEqual}`);
                const result = isSameWorkstation && (isAfterOrEqual);
                console.log(`    Resultado: ${result}`);
                return result;
              });
            });

            if (isAvailableForProfessionals && isAvailableForWorkstations) {
              console.log('Disponible en: ', currentStartUTC);
              availableStartTimes.push(new Date(currentStartUTC));
            }

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


  private hasFutureCollision(currentStartTime: Date, existingAppointments: DetailsAppointment[], serviceDuration: number): boolean {
    const endTime = addMinutes(currentStartTime, serviceDuration);
    return existingAppointments.some(app =>
      isBefore(currentStartTime, app.datetimeStart) &&
      isAfter(endTime, app.datetimeStart)
    );
  }


  private hasDetailsCollision(currentStartTime: Date, existingAppointments: DetailsAppointment[]): boolean {
    return existingAppointments.some(app => 
      isBefore(currentStartTime, addMinutes(app.datetimeStart, app.durationNow)) &&
      isAfter(addMinutes(currentStartTime, 1), app.datetimeStart)
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

















