// import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
// import { AppointmentDto } from './dto/appointment.dto';
// import { PaginationAppointmentDto } from './dto/pagination-appointment.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Appointment } from './entities/appointment.entity';
// import { LessThan, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
// import { Package } from '@/package/entities/package.entity';
// import { addMinutes } from 'date-fns';

// @Injectable()
// export class AppointmentService {

//   @InjectRepository(Appointment)
//   private readonly appointmentRepository: Repository<Appointment>;

//   @InjectRepository(Package)
//   private readonly packageRepository: Repository<Package>;
  
  
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  // async create(params: { body: AppointmentDto }): Promise<Appointment> {
  //   console.log("desde el servicio params.body: ", params.body);

  //   // Obtiene el paquete por ID
  //   const pkg = await this.packageRepository.findOne({
  //     where: {
  //       id: params.body.package.id,
  //     },
  //     relations: ['services'],
  //   });
  //   if (!pkg) throw new HttpException('Package not found', HttpStatus.NOT_FOUND);

  //   //Debo tomar como datetimeEnd el datetimeStart + la duración del paquete
  //   // Verifica si la duración del paquete es válida
  //   const packageDuration = params.body.package.duration;

  //   if (!packageDuration || packageDuration <= 0) {
  //     throw new HttpException('Package duration is required', HttpStatus.BAD_REQUEST);
  //   }

  //   // Verifica si existe alguna cita en el rango de fechas y horas con el mismo empleado
  //   const existingAppointment = await this.appointmentRepository.findOne({
  //     where: [
  //       { datetimeStart: LessThanOrEqual(params.body.datetimeEnd),
  //         datetimeEnd: MoreThanOrEqual(params.body.datetimeStart),
  //         employee: params.body.employee,
  //       }
  //     ]
  //   });
  //   if (existingAppointment) {
  //     throw new HttpException('Appointment already exists in the given time range for the same employee', HttpStatus.CONFLICT);
  //   }

  //   // Verifica si existe alguna cita en el rango de fechas y horas con el mismo cliente
  //   const existingAppointmentClient = await this.appointmentRepository.findOne({
  //     where: [
  //       { datetimeStart: LessThanOrEqual(params.body.datetimeEnd),
  //         datetimeEnd: MoreThanOrEqual(params.body.datetimeStart),
  //         client: params.body.client,
  //       }
  //     ]
  //   });
  //   if (existingAppointmentClient) {
  //     throw new HttpException('Appointment already exists in the given time range for the same client', HttpStatus.CONFLICT);
  //   }

  //   // Verifica si la estación de trabajo está ocupada en el rango de fechas y horas
  //   const existingWorkstation = await this.appointmentRepository.findOne({
  //     where: [
  //       { datetimeStart: LessThanOrEqual(params.body.datetimeEnd),
  //         datetimeEnd: MoreThanOrEqual(params.body.datetimeStart),
  //         workstation: params.body.workstation,
  //       }
  //     ]
  //   })
  //   if (existingWorkstation) {
  //     throw new HttpException('Workstation is already occupied in the given time range', HttpStatus.CONFLICT);
  //   }

    // Crea la cita, tomando como datetimeStart 


    
//   }
//   ////////////////////////////////////////////////
//   ////////////////////////////////////////////////

  
// }
