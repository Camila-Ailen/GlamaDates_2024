import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Appointment } from "./entities/appointment.entity";
import { Package } from "@/package/entities/package.entity";
import { Between, Brackets, In, IsNull, Not, Repository } from "typeorm";
import { addMinutes, endOfDay, format, isAfter, isBefore, isEqual, startOfDay, subMinutes } from "date-fns";
import { Service } from "@/service/entities/service.entity";
import { SystemConfigService } from "@/system-config/system-config.service";
import { SystemConfig } from "@/system-config/entities/system-config.entity";
import { DaysOfWeek } from "@/system-config/entities/DaysOfWeek.enum";
import { AppointmentDto } from "./dto/appointment.dto";
import { User } from "@/users/entities/user.entity";
import { DetailsAppointment } from "@/details-appointment/entities/details-appointment.entity";
import { AppointmentState } from "./entities/appointment-state.enum";
import { Workstation } from "@/workstation/entities/workstation.entity";
import { WorkstationState } from "@/workstation/entities/workstation-state.enum";
import { PaginationAppointmentDto } from "./dto/pagination-appointment.dto";
import { PaginationResponseDTO } from "@/base/dto/base.dto";
import { MercadopagoService } from "@/mercadopago/mercadopago.service";
import { PaymentMethod } from "@/payment/entities/payment-method.enum";
import { PaymentType } from "@/payment/entities/payment-type.enum";
import { PaymentStatus } from "@/payment/entities/payment-status.enum";
import { PaymentService } from "@/payment/payment.service";
import { PaymentDto } from "@/payment/dto/payment.dto";
import { DiscountType } from "./entities/discountTypes";
import { MailerService } from "@/mailer/mailer.service";
import * as fs from 'fs';
import * as path from 'path';
import { ok } from "assert";
import { Cron } from "@nestjs/schedule";
import { Auditoria } from "@/auditoria/entities/auditoria.entity";
import { AuditoriaService } from "@/auditoria/auditoria.service";
import { DetailsAppointmentDto } from "@/details-appointment/dto/details-appointment.dto";

@Injectable()
export class AppointmentService {
  // @Inject((forwardRef(() => MercadopagoService)))
  // @Inject(MercadopagoService)
  // private mercadopagoService: MercadopagoService;

  @Inject(PaymentService)
  private paymentService: PaymentService;

  employeeRepository: any;
  usersRepository: any;

  constructor(

    @Inject(forwardRef(() => MercadopagoService))
    private readonly mercadopagoService: MercadopagoService,

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

    private readonly mailerService: MailerService,

    private readonly auditoriaService: AuditoriaService,
  ) { }

  ////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////
  // Registrar pago en efectivo
  async registerCashPayment(appointmentId: number, body): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({ where: { id: appointmentId }, relations: ['payments'] });
    if (!appointment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }

    if (appointment.pending <= 0) {
      throw new HttpException('No pending amount to pay', HttpStatus.BAD_REQUEST);
    }

    const payment = new PaymentDto();
    payment.datetime = new Date();
    payment.amount = appointment.pending;
    payment.paymentMethod = PaymentMethod.CASH;
    payment.paymentType = PaymentType.TOTAL;
    payment.status = PaymentStatus.COMPLETED;
    payment.observation = body.observation || '';
    payment.transactionId = await this.generateTransactionId();
    payment.appointment = appointment;
    payment.updated_at = new Date();

    await this.paymentService.update({ id: appointment.payments[0].id, body: payment }); //siempre considerando un solo pago

    appointment.pending = 0;
    if (appointment.state === AppointmentState.PENDING) {
      appointment.state = AppointmentState.ACTIVE;
    } else if (appointment.state === AppointmentState.DELINQUENT) {
      appointment.state = AppointmentState.COMPLETED;
    } else if (appointment.state === AppointmentState.IN_PROGRESS_UNPAID) {
      appointment.state = AppointmentState.IN_PROGRESS_PAY
    } else {
      console.log("Hay algun error con el cambio de estado del turno")
    }

    this.appointmentRepository.save(appointment);

    // Envio el mail con el comprobante de pago

    await this.paymentService.sendPaymentConfirmationEmailWithPdf(appointment.payments[0].id);
  }

  ////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////
  async generateTransactionId(): Promise<string> {
    let transactionId: string;
    let exists = true;

    while (exists) {
      // Generar un ID de transacción aleatorio
      transactionId = `EF${Math.floor(10000000 + Math.random() * 90000000)}`; // Genera un número aleatorio de 8 cifras

      // Verificar si ya existe en la base de datos
      const existingPayment = await this.paymentService.existsByTransaction(transactionId);
      exists = !!existingPayment; // Si existe, repetir el ciclo
    }

    return transactionId;
  }


  ///////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////
  async getById(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id,
      },
      relations: ['details', 'details.employee', 'details.workstation', 'details.service', 'client', 'package', 'package.services', 'payments'],
    });
    return appointment;
  }

  ////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////
  async create(body: AppointmentDto, user: User): Promise<Appointment> {
    // Se pasa a tipo unknown porque sino toma solo al paquete 5
    const pkg = await this.packageRepository.findOne({ where: { id: body.package as unknown as number }, relations: ['services'] });
    body.package = pkg;


    // Verifico que hayan servicios en el paquete y los guardo en body.package.services
    if (body.package && body.package.services.length > 0) {
      const service = await this.serviceRepository.find({
        where: {
          id: In(body.package.services.map((service: Service) => service.id)),
        },
        relations: ['category'],
      });
      body.package.services = service;
    }

    // Guardo la fecha y horario de la cita
    const appointmentDate = new Date(body.datetimeStart);

    // Primero traigo los datos globales
    const config = await this.configService.getSystemConfig();

    // Verifico que la fecha y horario de la cita no estén ocupados
    for (const service of body.package.services) {
      const professionals = await this.findProffesionals(service.id, this.userRepository);
      const workstations = await this.findWorkstations(service.id, this.workstationRepository);

      // Espero que funcione usar esto :v
      const existingAppointmentsDetail = await this.colisionAvailable(appointmentDate, service.duration, service.category.id);

      if (existingAppointmentsDetail.length >= professionals.length && existingAppointmentsDetail.length >= workstations.length) {
        throw new HttpException('No hay espacio disponible para esta cita', HttpStatus.BAD_REQUEST);
      }
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
      advance: body.advance,
    });


    // Guardo el turno para tener su id
    const savedAppointment = await this.appointmentRepository.save(appointmentEntity);


    // debo iterar sobre los servicios del paquete para crear los detalles
    for (const service of body.package.services) {
      // Obtener los profesionales y estaciones de trabajo disponibles
      let body = new DetailsAppointmentDto();
      body.service = service;
      body.datetimeStart = appointmentDate;
      const { selectedProfessional, selectedWorkstation } = await this.verifyProfessionalsWorkstations(body);

      if (selectedProfessional.length === 0) {
        throw new Error('No hay profesionales disponibles.');
      }

      const randomIndexEmployee = Math.floor(Math.random() * selectedProfessional.length);
      const employee = selectedProfessional[randomIndexEmployee];

      if (selectedWorkstation.length === 0) {
        throw new Error('No hay estaciones de trabajo disponibles.');
      }

      const randomIndexStation = Math.floor(Math.random() * selectedWorkstation.length);
      const workstation = selectedWorkstation[randomIndexStation];

      if (!employee || !workstation) {
        throw new Error('Profesional o estación de trabajo inválidos.');
      }

      if (!employee.id) {
        throw new Error('El empleado seleccionado no tiene un ID válido.');
      }

      if (!workstation.id) {
        throw new Error('La estación de trabajo seleccionada no tiene un ID válido.');
      }

      const detail = this.detailsAppointmentRepository.create({
        appointment: savedAppointment,
        service: service,
        priceNow: service.price,
        durationNow: service.duration,
        datetimeStart: appointmentDate,
        workstation: workstation,
        employee: { id: employee.id },
        createdAt: new Date(),
      });
      // Guardo el detalle
      await this.detailsAppointmentRepository.save(detail);
    }
    // Actualizo el appointment con el valor total
    let total = body.package.services.reduce((total, service) => total + service.price, 0);
    if (body.discount) {
      // Descuento para fecha y hora
      if (body.discount === 1) {
        body.discountType = DiscountType.FULL
        body.discount = total * config.descountFull / 100
      } else if (body.discount === 2) {
        body.discountType = DiscountType.PARTIAL
        body.discount = total * config.descountPartial / 100
      }
    } else {
      body.discountType = DiscountType.NONE
      body.discount = 0
    }
    const pending = total - body.discount;
    await this.appointmentRepository.update(savedAppointment.id, { total, discount: body.discount, pending, discountType: body.discountType });

    const prefId = await this.mercadopagoService.create(savedAppointment.id.toString());

    // Creo el pago
    const payment = new PaymentDto();
    payment.datetime = null;
    payment.amount = 0;
    payment.paymentMethod = PaymentMethod.CASH;
    payment.paymentType = PaymentType.TOTAL;
    payment.status = PaymentStatus.PENDING;
    payment.observation = '';
    payment.transactionId = '';
    payment.paymentURL = prefId.id;
    payment.appointment = savedAppointment;
    payment.created_at = new Date();

    await this.paymentService.create({ body: payment });

    // Envio el mail de confirmacion
    await this.sendAppointmentConfirmationEmail(savedAppointment.id);

    return await this.getById(savedAppointment.id);
  }

  ///////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////
  // Verifica y trae los profesionales y estaciones de trabajo disponibles
  async verifyProfessionalsWorkstations(
    body: DetailsAppointmentDto,
  ): Promise<{ selectedProfessional: User[]; selectedWorkstation: Workstation[] }> {

    let serviceId: number;

    if (body.service && typeof body.service === 'object' && 'id' in body.service) {
      serviceId = body.service.id;
    } else {
      serviceId = Number(body.service);
    }

    const appointmentDate = body.datetimeStart;
    // obtengo el servicio
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
      relations: ['category'],
    });

    // Buscamos los profesionales de la categoria del servicio
    const professionals = await this.findProffesionals(service.id, this.userRepository);
    const workstations = await this.findWorkstations(service.id, this.workstationRepository);

    // Citas existentes en ese horario con esa categoria
    const existingAppointmentsDetail = await this.colisionAvailable(appointmentDate, service.duration, service.category.id);
    const existingAppointmentsDetailIds = existingAppointmentsDetail.map(detail => detail.id);

    const professionalIds = professionals.map(professional => professional.id);
    const workstationIds = workstations.map(workstation => workstation.id);

    let selectedProfessional: User[] = [];
    let selectedWorkstation: Workstation[] = [];
    if (existingAppointmentsDetailIds.length > 0) {
      const rawWorkstations = await this.detailsAppointmentRepository
        .createQueryBuilder('details')
        .innerJoin('details.workstation', 'workstation')
        .select([
          'workstation.id AS workstation_id',
          'workstation.name AS workstation_name',
          'workstation.description AS workstation_description',
          'workstation.state AS workstation_state',
          'workstation.createdAt AS workstation_created_at',
          'workstation.updatedAt AS workstation_updated_at',
          'workstation.deletedAt AS workstation_deleted_at',
        ])
        .where(
          'workstation.id NOT IN (SELECT "workstationId" FROM "details_appointments" WHERE id IN (:...existingAppointmentsDetailIds))',
          { existingAppointmentsDetailIds: existingAppointmentsDetail.map(detail => detail.id) }
        )
        .andWhere('workstation.id IN (:...workstationIds)', { workstationIds })
        .groupBy(
          'workstation.id, workstation.name, workstation.description, workstation.state, workstation.createdAt, workstation.updatedAt, workstation.deletedAt'
        )
        .getRawMany();

      const rawProfessionals = await this.detailsAppointmentRepository
        .createQueryBuilder('details')
        .innerJoin('details.employee', 'employee')
        .select([
          'employee.id AS employee_id',
          'employee.firstName AS employee_first_name',
          'employee.lastName AS employee_last_name',
          'employee.email AS employee_email',
          'employee.birthdate AS employee_birthdate',
          'employee.gender AS employee_gender',
          'employee.phone AS employee_phone',
          'employee.emailToken AS employee_email_token',
          'employee.emailVerifiedAt AS employee_email_verified_at',
          'employee.emailChange AS employee_email_change',
          'employee.password AS employee_password',
          'employee.rememberToken AS employee_remember_token',
          'employee.branchOfficeId AS employee_branch_office_id',
          'employee.createdAt AS employee_created_at',
          'employee.updatedAt AS employee_updated_at',
          'employee.deletedAt AS employee_deleted_at',
        ])
        .where(
          'employee.id NOT IN (SELECT "employeeId" FROM "details_appointments" WHERE id IN (:...existingAppointmentsDetailIds))',
          { existingAppointmentsDetailIds }
        )
        .andWhere('employee.id IN (:...professionalIds)', { professionalIds })
        .groupBy('employee.id, employee.firstName, employee.lastName, employee.email, employee.birthdate, employee.gender, employee.phone, employee.emailToken, employee.emailVerifiedAt, employee.emailChange, employee.password, employee.rememberToken, employee.branchOfficeId, employee.createdAt, employee.updatedAt, employee.deletedAt')
        .getRawMany();

      selectedWorkstation = rawWorkstations.map(workstation => ({
        id: workstation.workstation_id,
        name: workstation.workstation_name,
        description: workstation.workstation_description,
        state: workstation.workstation_state,
        categories: [],
        detailsAppointment: [],
        createdAt: workstation.workstation_created_at,
        updatedAt: workstation.workstation_updated_at,
        deletedAt: workstation.workstation_deleted_at,
        toJSON: () => ({})
      }))

      selectedProfessional = rawProfessionals.map(prof => ({
        id: prof.employee_id,
        firstName: prof.employee_first_name,
        lastName: prof.employee_last_name,
        email: prof.employee_email,
        birthdate: prof.employee_birthdate,
        gender: prof.employee_gender,
        phone: prof.employee_phone,
        emailToken: prof.employee_email_token,
        emailVerifiedAt: prof.employee_email_verified_at,
        emailChange: prof.employee_email_change,
        password: prof.employee_password,
        rememberToken: prof.employee_remember_token,
        branchOfficeId: prof.employee_branch_office_id,
        createdAt: prof.employee_created_at,
        updatedAt: prof.employee_updated_at,
        deletedAt: prof.employee_deleted_at,
        role: null,
        categories: [],
        appointmentClient: [],
        detailsAppointmentEmployee: [],
        toJSON: () => ({})
      }));

    } else {
      selectedProfessional = professionals;
      selectedWorkstation = workstations;
    }

    return { selectedProfessional, selectedWorkstation };
  }

  ////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////
  // editar profesionales y estaciones de trabajo de un detalle de cita
  async editProfessionalAndWorkstation(id: number, body: DetailsAppointmentDto): Promise<DetailsAppointment> {
    const detail = await this.detailsAppointmentRepository.findOne({
      where: { id },
      relations: ['appointment', 'service', 'workstation', 'employee'],
    });

    if (!detail) {
      throw new HttpException('Detail not found', HttpStatus.NOT_FOUND);
    }

    // Verifico que en la fecha y horario esten disponibles el profesional y la estacion de trabajo
    const dates = new DetailsAppointmentDto();
    dates.datetimeStart = detail.datetimeStart;
    dates.service = detail.service;
    const { selectedProfessional, selectedWorkstation } = await this.verifyProfessionalsWorkstations(dates);

    // Verifico que el profesional y la estacion de trabajo esten disponibles
    const employeeId = typeof body.employee === 'string' ? parseInt(body.employee, 10) : body.employee;
    const workstationId = typeof body.workstation === 'string' ? parseInt(body.workstation, 10) : body.workstation;


    const professionalAvailable = selectedProfessional.find(prof => prof.id === employeeId);
    const workstationAvailable = selectedWorkstation.find(station => station.id === workstationId);
    /*
    if (!professionalAvailable) {
      throw new HttpException('Professional not available', HttpStatus.BAD_REQUEST);
    }
    if (!workstationAvailable) {
      throw new HttpException('Workstation not available', HttpStatus.BAD_REQUEST);
    }
      */

    // Actualizo el detalle
    detail.employee = { id: employeeId } as User;
    detail.workstation = { id: workstationId } as Workstation;

    return await this.detailsAppointmentRepository.save(detail);
  }

  ////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////
  async cancel(params: { id: number, body: AppointmentDto }): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: params.id },
      relations: ['payments', 'details', 'details.service', 'details.service.category', 'details.employee'],
    });

    if (!appointment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }

    if (appointment.state === AppointmentState.CANCELLED) {
      throw new HttpException('Appointment already canceled', HttpStatus.BAD_REQUEST);
    }

    if (appointment.state === AppointmentState.INACTIVE) {
      throw new HttpException('Appointment already inactive', HttpStatus.BAD_REQUEST);
    }

    if (appointment.state === AppointmentState.COMPLETED) {
      throw new HttpException('Appointment already completed', HttpStatus.BAD_REQUEST);
    }

    if (appointment.state === AppointmentState.DELINQUENT) {
      throw new HttpException('Appointment already delinquent', HttpStatus.BAD_REQUEST);
    }

    if (appointment.state === AppointmentState.ACTIVE) {
      throw new HttpException('Appointment already active', HttpStatus.BAD_REQUEST);
    }

    if (appointment.state === AppointmentState.DEPOSITED) {
      throw new HttpException('Appointment already deposited', HttpStatus.BAD_REQUEST);
    }

    if (appointment.state === AppointmentState.PENDING) {
      appointment.state = AppointmentState.CANCELLED;
      appointment.pending = 0;
      await this.appointmentRepository.save(appointment);

      var pay = new PaymentDto();
      pay.id = appointment.payments[0].id;
      pay.status = PaymentStatus.CANCELLED;
      pay.datetime = new Date();

      await this.paymentService.update({ id: pay.id, body: pay });

      // Envio el mail de cancelacion
      await this.sendAppointmentCancellationEmail(appointment.id);

      // Ahora se calcula a quienes se le puede recomendar la cita
      await this.notifyClientsForReappointments(appointment);
    }

    return appointment;
  }

  async suggestReappointments(cancelledAppointment: Appointment): Promise<DetailsAppointment[]> {
    const { details } = cancelledAppointment;
    const config = await this.configService.getSystemConfig();
    const intervalMinutes = config.intervalMinutes;

    const suggestions = [];

    for (const detail of details) {
      const { durationNow: duration, datetimeStart } = detail;
      const category = detail.service.category.id;

      const roundedDuration = Math.ceil(duration / intervalMinutes) * intervalMinutes;

      const futureAppointments = await this.detailsAppointmentRepository.createQueryBuilder('details')
        .innerJoinAndSelect('details.appointment', 'appointment')
        .innerJoinAndSelect('appointment.client', 'client')
        .innerJoinAndSelect('appointment.package', 'package')
        .innerJoin('details.service', 'service')
        .innerJoin('service.category', 'category')
        .where('category.id = :categoryId', { categoryId: category })
        .andWhere('details.durationNow <= :roundedDuration', { roundedDuration })
        .andWhere('details.datetimeStart > :datetimeStart', { datetimeStart })
        .andWhere('appointment.advance = true')
        .andWhere(
          new Brackets(qb => {
            qb.where('appointment.state = :activeState', { activeState: AppointmentState.ACTIVE })
              .orWhere('appointment.state = :pendingState', { pendingState: AppointmentState.PENDING })
              .orWhere('appointment.state = :depositedState', { depositedState: AppointmentState.DEPOSITED });
          })
        )
        .getMany();



      suggestions.push(...futureAppointments);
    }

    return suggestions;
  }


  /////////////////////////////////////////////////////////
  // CORREOS // MAILS
  ////////////////////////////////////////////////////////
  // Notifica a los clientes para reacomodar la cita
  async notifyClientsForReappointments(cancelledAppointment: Appointment): Promise<void> {
    const suggestions = await this.suggestReappointments(cancelledAppointment);

    if (suggestions.length === 0) {
      return;
    }

    const emailTemplatePath = path.join(__dirname, '../mailer/templates/reappointment-email-template.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    const cancelledAppointmentDate = new Date(cancelledAppointment.datetimeStart).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const cancelledAppointmentTime = new Date(cancelledAppointment.datetimeStart).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    for (const suggestion of suggestions) {
      const client = suggestion.appointment.client;
      if (client) {
        const suggestedAppointmentDate = new Date(suggestion.datetimeStart).toLocaleDateString('es-ES', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })

        const suggestedAppointmentTime = new Date(suggestion.datetimeStart).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        const packageName = suggestion.appointment.package?.name || 'N/A';
        const packageDescription = suggestion.appointment.package?.description || 'N/A';

        const reappointmentLink = `${process.env.FRONTEND_URL}/rearrange/?datetime=${encodeURIComponent(cancelledAppointment.datetimeStart.toISOString())}&packageId=${suggestion.appointment.package.id}&appointmentId=${suggestion.appointment.id}`;

        let emailContent = emailTemplate.replace('{{clientName}}', client.firstName + ' ' + client.lastName);
        emailContent = emailContent.replace('{{cancelledAppointmentDate}}', cancelledAppointmentDate);
        emailContent = emailContent.replace('{{cancelledAppointmentTime}}', cancelledAppointmentTime);
        emailContent = emailContent.replace('{{suggestedAppointmentDate}}', suggestedAppointmentDate);
        emailContent = emailContent.replace('{{suggestedAppointmentTime}}', suggestedAppointmentTime);
        emailContent = emailContent.replace('{{packageName}}', packageName);
        emailContent = emailContent.replace('{{suggestedAppointmentId}}', suggestion.appointment.id.toString());
        emailContent = emailContent.replace('{{packageDescription}}', packageDescription);
        emailContent = emailContent.replace('{{reappointmentLink}}', reappointmentLink);

        await this.mailerService.sendEmail(
          'info@glamadates.com',
          'Reacomodamiento de Turno Disponible',
          [client.email],
          emailContent
        );
      } else {
        console.log('No se encontró el cliente para la cita:', suggestion.appointment.id);
      }
    }
  }

  ////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////
  async sendAppointmentConfirmationEmail(appointmentId: number): Promise<void> {
    // Busca la cita con todas las relaciones necesarias
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: [
        'client',
        'details',
        'details.employee',
        'package',
        'package.services'
      ],
    });

    if (!appointment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }

    // Carga la plantilla
    const emailTemplatePath = path.join(__dirname, '../mailer/templates/appointment-confirmation-email.html');
    let emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Datos para el mail
    const client = appointment.client;
    const packageName = appointment.package?.name || 'N/A';
    const appointmentDate = new Date(appointment.datetimeStart).toLocaleDateString('es-ES', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
    const appointmentTime = new Date(appointment.datetimeStart).toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    const duration = appointment.details.reduce((sum, d) => sum + (d.durationNow || 0), 0);
    const professionalName = appointment.details[0]?.employee
      ? `${appointment.details[0].employee.firstName} ${appointment.details[0].employee.lastName}`
      : 'A confirmar';
    const price = appointment.total || 0;
    const appointmentIdStr = appointment.id.toString();
    const viewAppointmentLink = `${process.env.FRONTEND_URL}/myDate`;

    // Reemplaza los placeholders
    emailTemplate = emailTemplate.replace('{{clientName}}', `${client.firstName} ${client.lastName}`);
    emailTemplate = emailTemplate.replace('{{packageName}}', packageName);
    emailTemplate = emailTemplate.replace('{{appointmentDate}}', appointmentDate);
    emailTemplate = emailTemplate.replace('{{appointmentTime}}', appointmentTime);
    emailTemplate = emailTemplate.replace('{{duration}}', duration.toString());
    emailTemplate = emailTemplate.replace('{{professionalName}}', professionalName);
    emailTemplate = emailTemplate.replace('{{price}}', price.toString());
    emailTemplate = emailTemplate.replace('{{appointmentId}}', appointmentIdStr);
    emailTemplate = emailTemplate.replace('{{viewAppointmentLink}}', viewAppointmentLink);

    // Envía el mail
    await this.mailerService.sendEmail(
      'info@glamadates.com',
      'Confirmación de Cita',
      [client.email],
      emailTemplate
    );
  }

  ////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////
  // Recuerda a los clientes sobre sus citas
  async sendAppointmentReminderEmail(appointmentId: number): Promise<void> {
    // Busca la cita con todas las relaciones necesarias
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: [
        'client',
        'details',
        'details.employee',
        'package',
        'package.services'
      ],
    });

    if (!appointment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }

    // Carga la plantilla
    const emailTemplatePath = path.join(__dirname, '../mailer/templates/appointment-reminder-email.html');
    let emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Datos para el mail
    const client = appointment.client;
    const packageName = appointment.package?.name || 'N/A';
    const appointmentDate = new Date(appointment.datetimeStart).toLocaleDateString('es-ES', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
    const appointmentTime = new Date(appointment.datetimeStart).toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    const duration = appointment.details.reduce((sum, d) => sum + (d.durationNow || 0), 0);
    const professionalName = appointment.details[0]?.employee
      ? `${appointment.details[0].employee.firstName} ${appointment.details[0].employee.lastName}`
      : 'A confirmar';
    const viewAppointmentLink = `${process.env.FRONTEND_URL}/appointment/${appointment.id}`;

    // Reemplaza los placeholders
    emailTemplate = emailTemplate.replace('{{clientName}}', `${client.firstName} ${client.lastName}`);
    emailTemplate = emailTemplate.replace('{{packageName}}', packageName);
    emailTemplate = emailTemplate.replace('{{appointmentDate}}', appointmentDate);
    emailTemplate = emailTemplate.replace('{{appointmentTime}}', appointmentTime);
    emailTemplate = emailTemplate.replace('{{duration}}', duration.toString());
    emailTemplate = emailTemplate.replace('{{professionalName}}', professionalName);
    emailTemplate = emailTemplate.replace('{{viewAppointmentLink}}', viewAppointmentLink);

    // Envía el mail
    await this.mailerService.sendEmail(
      'info@glamadates.com',
      'Recordatorio de tu cita',
      [client.email],
      emailTemplate
    );
  }

  ////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////
  // Cron para enviar recordatorios de citas
  @Cron('0 8 * * *') // Todos los días a las 8:00 AM
  async sendRemindersForTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const appointments = await this.appointmentRepository.find({
      where: {
        datetimeStart: Between(tomorrow, dayAfter),
        state: In([AppointmentState.PENDING, AppointmentState.ACTIVE, AppointmentState.IN_PROGRESS_UNPAID, AppointmentState.IN_PROGRESS_PAY]),
      },
      relations: ['client', 'details', 'details.employee', 'package', 'package.services'],
    });

    for (const appointment of appointments) {
      await this.sendAppointmentReminderEmail(appointment.id);
    }
  }

  /////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  // Envia correo tras cancelar cita
  async sendAppointmentCancellationEmail(appointmentId: number): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: [
        'client',
        'details',
        'details.employee',
        'package',
        'package.services'
      ],
    });

    if (!appointment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }

    // Carga la plantilla
    const emailTemplatePath = path.join(__dirname, '../mailer/templates/appointment-cancellation-email.html');
    let emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Datos para el mail
    const client = appointment.client;
    const packageName = appointment.package?.name || 'N/A';
    const appointmentDate = new Date(appointment.datetimeStart).toLocaleDateString('es-ES', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
    const appointmentTime = new Date(appointment.datetimeStart).toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    const professionalName = appointment.details[0]?.employee
      ? `${appointment.details[0].employee.firstName} ${appointment.details[0].employee.lastName}`
      : 'A confirmar';
    const appointmentIdStr = appointment.id.toString();
    const cancellationDate = new Date().toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const newAppointmentLink = `${process.env.FRONTEND_URL}/catalog`;

    // Reemplaza los placeholders
    emailTemplate = emailTemplate.replace('{{clientName}}', `${client.firstName} ${client.lastName}`);
    emailTemplate = emailTemplate.replace('{{packageName}}', packageName);
    emailTemplate = emailTemplate.replace('{{appointmentDate}}', appointmentDate);
    emailTemplate = emailTemplate.replace('{{appointmentTime}}', appointmentTime);
    emailTemplate = emailTemplate.replace('{{professionalName}}', professionalName);
    emailTemplate = emailTemplate.replace('{{appointmentId}}', appointmentIdStr);
    emailTemplate = emailTemplate.replace('{{cancellationDate}}', cancellationDate);
    emailTemplate = emailTemplate.replace('{{newAppointmentLink}}', newAppointmentLink);

    // Envía el mail
    await this.mailerService.sendEmail(
      'info@glamadates.com',
      'Tu cita ha sido cancelada',
      [client.email],
      emailTemplate
    );
  }

  ////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////
  // Envia correo por citas inactivas
  async sendAppointmentInactiveEmail(appointmentId: number): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: [
        'client',
        'details',
        'details.employee',
        'package',
        'package.services'
      ],
    });

    if (!appointment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }

    // Carga la plantilla
    const emailTemplatePath = path.join(__dirname, '../mailer/templates/appointment-inactive-email.html');
    let emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Datos para el mail
    const client = appointment.client;
    const packageName = appointment.package?.name || 'N/A';
    const appointmentDate = new Date(appointment.datetimeStart).toLocaleDateString('es-ES', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
    const appointmentTime = new Date(appointment.datetimeStart).toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    const professionalName = appointment.details[0]?.employee
      ? `${appointment.details[0].employee.firstName} ${appointment.details[0].employee.lastName}`
      : 'A confirmar';
    const appointmentIdStr = appointment.id.toString();
    const newAppointmentLink = `${process.env.FRONTEND_URL}/catalog`;

    // Reemplaza los placeholders
    emailTemplate = emailTemplate.replace('{{clientName}}', `${client.firstName} ${client.lastName}`);
    emailTemplate = emailTemplate.replace('{{packageName}}', packageName);
    emailTemplate = emailTemplate.replace('{{appointmentDate}}', appointmentDate);
    emailTemplate = emailTemplate.replace('{{appointmentTime}}', appointmentTime);
    emailTemplate = emailTemplate.replace('{{professionalName}}', professionalName);
    emailTemplate = emailTemplate.replace('{{appointmentId}}', appointmentIdStr);
    emailTemplate = emailTemplate.replace('{{newAppointmentLink}}', newAppointmentLink);

    // Envía el mail
    await this.mailerService.sendEmail(
      'info@glamadates.com',
      'Tu cita ha sido marcada como inactiva',
      [client.email],
      emailTemplate
    );
  }

  ////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////
  // Envia correo por citas morosas
  async sendAppointmentDelinquentEmail(appointmentId: number): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: [
        'client',
        'details',
        'details.employee',
        'package',
        'package.services',
        'payments'
      ],
    });

    if (!appointment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }

    // Carga la plantilla
    const emailTemplatePath = path.join(__dirname, '../mailer/templates/appointment-payment-reminder-email.html');
    let emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    // Datos para el mail
    const client = appointment.client;
    const packageName = appointment.package?.name || 'N/A';
    const appointmentDate = new Date(appointment.datetimeStart).toLocaleDateString('es-ES', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
    const appointmentTime = new Date(appointment.datetimeStart).toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    const professionalName = appointment.details[0]?.employee
      ? `${appointment.details[0].employee.firstName} ${appointment.details[0].employee.lastName}`
      : 'A confirmar';
    const appointmentIdStr = appointment.id.toString();
    const pendingAmount = appointment.pending || 0;
    // Busca el primer pago pendiente para obtener el link de pago (ajusta según tu lógica)
    const payment = appointment.payments?.find(p => p.status === 'PENDIENTE');
    const paymentLink = payment?.paymentURL || `${process.env.FRONTEND_URL || 'https://glamadates.com'}/payments`;

    // Reemplaza los placeholders
    emailTemplate = emailTemplate.replace('{{clientName}}', `${client.firstName} ${client.lastName}`);
    emailTemplate = emailTemplate.replace('{{packageName}}', packageName);
    emailTemplate = emailTemplate.replace('{{appointmentDate}}', appointmentDate);
    emailTemplate = emailTemplate.replace('{{appointmentTime}}', appointmentTime);
    emailTemplate = emailTemplate.replace('{{professionalName}}', professionalName);
    emailTemplate = emailTemplate.replace('{{appointmentId}}', appointmentIdStr);
    emailTemplate = emailTemplate.replace('{{pendingAmount}}', pendingAmount.toString());
    emailTemplate = emailTemplate.replace('{{paymentLink}}', paymentLink);

    // Envía el mail
    await this.mailerService.sendEmail(
      'info@glamadates.com',
      'Recordatorio de Pago Pendiente',
      [client.email],
      emailTemplate
    );
  }


  /////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  async hasAppointments(id, workstationId, date) {
    const appointments = await this.detailsAppointmentRepository.find({
      where: {
        [id === 'employee.id' ? 'employee.id' : 'workstation.id']: id,
        workstation: workstationId,
        datetimeStart: date
      }
    });
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
      const professionals = await this.findProffesionals(service.id, this.userRepository);
      const workstations = await this.findWorkstations(service.id, this.workstationRepository);
      if (professionals.length > 0 && workstations.length > 0) {
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
      } else {
        throw new HttpException('No hay profesionales o estaciones de trabajo disponibles para este paquete', HttpStatus.BAD_REQUEST);
      }
    }

    return this.paginateResults(availableStartTimes, page, pageSize);
  }


  async findProffesionals(serviceId: number, userRepository: Repository<User>) {
    const service = await this.serviceRepository.findOne({ where: { id: serviceId }, relations: ['category'] });
    if (!service) {
      throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
    }

    const serviceCategory = service.category.id;

    const users = await userRepository.createQueryBuilder('user')
      .innerJoin('user.categories', 'category')
      .where('category.id = :categoryId', { categoryId: serviceCategory })
      .distinct(true)
      .getMany();

    return users;
  }

  async findProffesionalsByCategory(serviceCategory: number, userRepository: Repository<User>) {
    const users = await userRepository.createQueryBuilder('user')
      .innerJoin('user.categories', 'category')
      .where('category.id = :categoryId', { categoryId: serviceCategory })
      .andWhere('user.deletedAt IS NULL')
      .distinct(true)
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
      .getMany();

    return workstations;
  }

  async findWorkstationsByCategory(serviceCategory: number, workstationRepository: Repository<Workstation>) {
    const workstations = await workstationRepository.createQueryBuilder('workstation')
      .innerJoin('workstation.categories', 'category')
      .where('category.id = :categoryId', { categoryId: serviceCategory })
      .distinct(true)
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

    // Obtener estaciones de trabajo de la categoria
    const workstations = await this.findWorkstationsByCategory(categoryId, this.workstationRepository);

    let lastStartTimeHour = closingHour1Hour;
    let lastStartTimeMinute = closingHour1Minute - serviceDuration;

    if (lastStartTimeMinute < 0) {
      lastStartTimeHour -= 1;
      lastStartTimeMinute += 60;
    }

    const lastStartTime = `${lastStartTimeHour.toString().padStart(2, '0')}:${lastStartTimeMinute.toString().padStart(2, '0')}:00`;

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


            if (currentStartUTC.getMinutes() % intervalMinutes === 0) {

              const colisionAppointmentsFuture = await this.colisionAvailableFuture(currentStartUTC, serviceDuration, categoryId);
              // Evaluo si hay cantidad de profesionales y estaciones de trabajo suficientes disponibles
              if (colisionAppointmentsFuture.length < professionals.length && colisionAppointmentsFuture.length < workstations.length) {
                // Como aqui todavia no se deben asignar, con saber que hay disponibles es suficiente
                availableStartTimes.push(new Date(currentStartUTC));
              }

            }
          }
        } else {

          if (currentStartUTC.getMinutes() % intervalMinutes === 0) {

            // turnos en colision con el horario actual
            const colisionAppointments = await this.colisionAvailable(currentStartUTC, serviceDuration, categoryId);

            // Evaluo si hay cantidad de profesionales y estaciones de trabajo suficientes disponibles
            if (colisionAppointments.length < professionals.length && colisionAppointments.length < workstations.length) {
              // Como aqui todavia no se deben asignar, con saber que hay disponibles es suficiente
              availableStartTimes.push(new Date(currentStartUTC));
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

    const existingAppointments = await this.detailsAppointmentRepository
      .createQueryBuilder('detailsAppointment')
      .innerJoin('detailsAppointment.service', 'service')
      .innerJoin('service.category', 'category')
      .innerJoin('detailsAppointment.appointment', 'appointment')
      .where('category.id = :categoryId', { categoryId: category })
      .andWhere('detailsAppointment.datetimeStart < :end AND detailsAppointment.datetimeStart + (detailsAppointment.durationNow * interval \'1 minute\') > :start', {
        start: currentStartTime,
        end: addMinutes(currentStartTime, serviceDuration),
      })
      .andWhere('appointment.state NOT IN (:...states)', { states: [AppointmentState.CANCELLED, AppointmentState.INACTIVE, AppointmentState.COMPLETED] })
      .getMany();

    return existingAppointments;
  }

  private async colisionAvailableFuture(currentStartTime: Date, serviceDuration: number, category: number) {
    // pasar a un array las citas de la categoria afectadas en el servicio

    const existingAppointments = await this.detailsAppointmentRepository
      .createQueryBuilder('detailsAppointment')
      .innerJoin('detailsAppointment.workstation', 'workstation')
      .innerJoin('workstation.categories', 'category')
      .innerJoin('detailsAppointment.appointment', 'appointment')
      .where('category.id = :categoryId', { categoryId: category })
      .andWhere('detailsAppointment.datetimeStart BETWEEN :start AND :end', {
        start: subMinutes(currentStartTime, serviceDuration),
        end: addMinutes(currentStartTime, serviceDuration),
      })
      .andWhere('appointment.state NOT IN (:...states)', { states: [AppointmentState.CANCELLED, AppointmentState.INACTIVE, AppointmentState.COMPLETED] })
      .getMany();

    return existingAppointments;
  }



  private isValidDayAndTime(currentStartTime: Date, config: SystemConfig, lastStartTime: string): boolean {
    const { openDays, openingHour1, closingHour1, openingHour2, closingHour2 } = config;

    const daysOfWeekArray = [
      DaysOfWeek.SUNDAY,
      DaysOfWeek.MONDAY,
      DaysOfWeek.TUESDAY,
      DaysOfWeek.WEDNESDAY,
      DaysOfWeek.THURSDAY,
      DaysOfWeek.FRIDAY,
      DaysOfWeek.SATURDAY,
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


  private hasFutureCollision(currentStartTime: Date, existingAppointments: DetailsAppointment[], serviceDuration: number): boolean {
    const endTime = addMinutes(currentStartTime, serviceDuration);
    return existingAppointments.some(app =>
    (isBefore(currentStartTime, app.datetimeStart) &&
      isAfter(endTime, app.datetimeStart))
    );
  }


  private hasDetailsCollision(currentStartTime: Date, existingAppointments: DetailsAppointment[]): boolean {
    return existingAppointments.some(app =>
      (isBefore(currentStartTime, addMinutes(app.datetimeStart, app.durationNow)) &&
        isAfter(addMinutes(currentStartTime, 1), app.datetimeStart)) ||
      (isBefore(currentStartTime, app.datetimeStart) &&
        isAfter(addMinutes(currentStartTime, 1), addMinutes(app.datetimeStart, app.durationNow)))
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

  ////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////
  async isPackageAssignable(packageId: number, datetimeStart: Date): Promise<boolean> {
    const pkg = await this.packageRepository.findOne({ where: { id: packageId }, relations: ['services', 'services.category'] });

    if (!pkg) {
      throw new HttpException('Package not found', HttpStatus.NOT_FOUND);
    }

    const appointmentDate = new Date(datetimeStart);

    for (const service of pkg.services) {
      const professionals = await this.findProffesionals(service.id, this.userRepository);
      const workstations = await this.findWorkstations(service.id, this.workstationRepository);

      if (professionals.length === 0 || workstations.length === 0) {
        return false;
      }

      const existingAppointmentsDetail = await this.colisionAvailable(appointmentDate, service.duration, service.category.id);

      if (existingAppointmentsDetail.length >= professionals.length || existingAppointmentsDetail.length >= workstations.length) {
        return false;
      }
    }

    return true;
  }


  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  // Funcion para actualizar a inactiva la cita
  @Cron("59 23 * * *") // Se ejecuta cada dia a las 23:59
  async updatePendingToInactive(): Promise<void> {
    try {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      // Encuentra todas las citas pendientes que se realizaron hoy
      const pendingAppointments = await this.appointmentRepository.find({
        where: {
          state: AppointmentState.PENDING,
          datetimeStart: Between(todayStart, todayEnd),
        },
        relations: ['payments'],
      });

      // Cambia el estado de las citas encontradas a "INACTIVO"
      for (const appointment of pendingAppointments) {
        appointment.state = AppointmentState.INACTIVE;
        appointment.pending = 0;

        var pay = new PaymentDto();
        pay.id = appointment.payments[0].id;
        pay.status = PaymentStatus.CANCELLED;
        pay.datetime = new Date();

        await this.appointmentRepository.save(appointment);
        await this.paymentService.update({ id: pay.id, body: pay });

        // envia el correo de aviso
        await this.sendAppointmentInactiveEmail(appointment.id);
      }

      console.log(`Se actualizaron ${pendingAppointments.length} citas de PENDIENTE a INACTIVO.`);
    } catch (error) {
      console.error(
        "Error al actualizar las citas de PENDIENTE a INACTIVO:",
        error
      );
      throw new HttpException(
        "Error al actualizar las citas",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  // Funcion para actualizar a cita en progreso
  async progressState(id: number): Promise<void> {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id },
        relations: ['details', 'details.service', 'details.service.category', 'details.employee'],
      });

      if (!appointment) {
        throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
      }

      if (appointment.state === AppointmentState.ACTIVE) {
        throw new HttpException('Appointment already in progress', HttpStatus.BAD_REQUEST);
      }

      appointment.state = AppointmentState.ACTIVE;
      await this.appointmentRepository.save(appointment);
    }
    catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  // Marcar como completado el servicio de un turno (desde el profesional)
  async completedService(id: number, user: number) {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id },
        relations: ['details', 'details.employee'],
      });

      if (!appointment) {
        throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
      }

      const detailappointment = appointment.details.find(
        (detail) => detail.employee.id === user
      );

      if (!detailappointment) {
        throw new HttpException('Detail Appointment not found', HttpStatus.NOT_FOUND);
      }

      // 🟡 GUARDAMOS COPIA DEL ESTADO ANTERIOR
      const oldAppointmentState = appointment.state;
      const oldDetail = { ...detailappointment };

      // ✅ Actualizamos
      detailappointment.isCompleted = true;
      await this.detailsAppointmentRepository.save(detailappointment);

      // Validaciones y cambios de estado...
      if (appointment.state === AppointmentState.COMPLETED ||
        appointment.state === AppointmentState.CANCELLED ||
        appointment.state === AppointmentState.INACTIVE ||
        appointment.state === AppointmentState.DELINQUENT) {
        throw new HttpException('Appointment cannot be updated', HttpStatus.BAD_REQUEST);
      }

      if (appointment.state === AppointmentState.PENDING) {
        appointment.state = AppointmentState.IN_PROGRESS_UNPAID;
      }
      if (appointment.state === AppointmentState.ACTIVE) {
        appointment.state = AppointmentState.IN_PROGRESS_PAY;
      }

      if (appointment.state === AppointmentState.IN_PROGRESS_UNPAID) {
        const allDetailsCompleted = appointment.details.every(detail => detail.isCompleted);
        appointment.state = allDetailsCompleted ? AppointmentState.DELINQUENT : AppointmentState.IN_PROGRESS_UNPAID;
      }

      if (appointment.state === AppointmentState.IN_PROGRESS_PAY) {
        const allDetailsCompleted = appointment.details.every(detail => detail.isCompleted);
        appointment.state = allDetailsCompleted ? AppointmentState.COMPLETED : AppointmentState.IN_PROGRESS_PAY;
      }

      await this.appointmentRepository.save(appointment);

      // 🔵 GUARDAMOS AUDITORÍA
      await this.auditoriaService.create({
        entity: 'appointment',
        idEntity: appointment.id,
        accion: 'COMPLETAR_TURNO',
        userId: user,
        oldData: {
          estado: oldAppointmentState,
          detail: {
            id: detailappointment.id,
            isCompleted: oldDetail.isCompleted,
          }
        },
        newData: {
          estado: appointment.state,
          detail: {
            id: detailappointment.id,
            isCompleted: detailappointment.isCompleted,
          }
        }
      });

    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  /////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////
  // cambiar estado del turno (con analisis de servicios en el turno)



  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////

  async all(params: {
    query: PaginationAppointmentDto;
  }): Promise<PaginationResponseDTO> {
    const emptyResponse = {
      total: 0,
      pageSize: 0,
      offset: params.query.offset,
      results: [],
    };

    try {
      if (Object.keys(params.query).length === 0) {
        return emptyResponse;
      }
      if (params.query.pageSize?.toString() === '0') {
        return emptyResponse;
      }

      const order = {};
      if (params.query.orderBy && params.query.orderType) {
        order[params.query.orderBy] = params.query.orderType;
      }

      const forPage = params.query.pageSize
        ? parseInt(params.query.pageSize.toString(), 10) || 10
        : 10;
      const skip = params.query.offset;

      const [appointments, total] = await this.appointmentRepository.findAndCount({
        where: {
          deletedAt: IsNull(),
        },
        relations: ['details', 'details.employee', 'details.workstation', 'details.service', 'client', 'package', 'payments'],
        order,
        take: forPage,
        skip,
      });

      return {
        total: total,
        pageSize: forPage,
        offset: params.query.offset,
        results: appointments,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////

  async allToday(params: {
    query: PaginationAppointmentDto;
  }): Promise<PaginationResponseDTO> {
    const emptyResponse = {
      total: 0,
      pageSize: 0,
      offset: params.query.offset,
      results: [],
    };

    try {
      if (Object.keys(params.query).length === 0) {
        return emptyResponse;
      }
      if (params.query.pageSize?.toString() === '0') {
        return emptyResponse;
      }

      const order = {};
      if (params.query.orderBy && params.query.orderType) {
        order[params.query.orderBy] = params.query.orderType;
      }

      const forPage = params.query.pageSize
        ? parseInt(params.query.pageSize.toString(), 10) || 10
        : 10;
      const skip = params.query.offset;

      const [appointments, total] = await this.appointmentRepository.findAndCount({
        where: {
          deletedAt: IsNull(),
          datetimeStart: Between(startOfDay(new Date()), endOfDay(new Date())),
        },
        relations: ['details', 'details.employee', 'details.workstation', 'details.service', 'client', 'package', 'payments'],
        order,
        take: forPage,
        skip,
      });



      return {
        total: total,
        pageSize: forPage,
        offset: params.query.offset,
        results: appointments,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  async allByUser(user: User, params: {
    query: PaginationAppointmentDto;
  }): Promise<PaginationResponseDTO> {
    const emptyResponse = {
      total: 0,
      pageSize: 0,
      offset: params.query.offset,
      results: [],
    };

    try {
      if (Object.keys(params.query).length === 0) {
        return emptyResponse;
      }
      if (params.query.pageSize?.toString() === '0') {
        return emptyResponse;
      }

      const order = {};
      if (params.query.orderBy && params.query.orderType) {
        order[params.query.orderBy] = params.query.orderType;
      }

      const forPage = params.query.pageSize
        ? parseInt(params.query.pageSize.toString(), 10) || 10
        : 10;
      const skip = params.query.offset;

      const [appointments, total] = await this.appointmentRepository.findAndCount({
        where: {
          deletedAt: IsNull(),
          client: { id: user.id },
        },
        relations: ['details', 'details.employee', 'details.workstation', 'details.service', 'client', 'package', 'package.services', 'package.services.category', 'payments'],
        order,
        take: forPage,
        skip,
      });

      return {
        total: total,
        pageSize: forPage,
        offset: params.query.offset,
        results: appointments,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  async allByUserDates(user: User): Promise<Appointment[]> {
    try {
      const [appointments, total] = await this.appointmentRepository.findAndCount({
        where: {
          deletedAt: IsNull(),
          state: Not(AppointmentState.CANCELLED),
          client: { id: user.id },
        },
        relations: ['details', 'details.employee', 'details.workstation', 'details.service', 'client', 'package', 'package.services', 'package.services.category', 'payments'],
      });

      return appointments;
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  async allByProfessional(user: User, params: {
    query: PaginationAppointmentDto;
  }): Promise<PaginationResponseDTO> {
    const emptyResponse = {
      total: 0,
      pageSize: 0,
      offset: params.query.offset,
      results: [],
    };

    try {
      if (Object.keys(params.query).length === 0) {
        return emptyResponse;
      }
      if (params.query.pageSize?.toString() === '0') {
        return emptyResponse;
      }

      const order = {};
      if (params.query.orderBy && params.query.orderType) {
        order[params.query.orderBy] = params.query.orderType;
      }

      const forPage = params.query.pageSize
        ? parseInt(params.query.pageSize.toString(), 10) || 10
        : 10;
      const skip = params.query.offset;

      const [appointments, total] = await this.appointmentRepository.findAndCount({
        where: {
          deletedAt: IsNull(),
          // client: { id: user.id },
          details: {
            employee: { id: user.id }
          },
          state: Not(AppointmentState.CANCELLED),
        },
        relations: ['details', 'details.employee', 'details.workstation', 'details.service', 'client', 'package', 'package.services', 'package.services.category', 'payments'],
        order,
        take: forPage,
        skip,
      });

      return {
        total: total,
        pageSize: forPage,
        offset: params.query.offset,
        results: appointments,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  /////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  async getTodayAppointments(): Promise<number> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const result = await this.detailsAppointmentRepository
      .createQueryBuilder('details')
      .innerJoin('details.appointment', 'appointment')
      .select('COUNT(*)', 'total_turnos')
      .where('"details"."datetimeStart" BETWEEN :todayStart AND :todayEnd', { todayStart, todayEnd })
      .andWhere('appointment.state != :cancelled', { cancelled: 'CANCELADO' })
      .getRawOne();

    return result ? Number(result.total_turnos) : 0;
  }

  /////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  async getThisMonthAppointments(): Promise<number> {
    const result = await this.detailsAppointmentRepository
      .createQueryBuilder('details')
      .innerJoin('details.appointment', 'appointment')
      .select('COUNT(*)', 'total_turnos')
      .where('EXTRACT(MONTH FROM "details"."datetimeStart") = EXTRACT(MONTH FROM CURRENT_DATE)')
      .andWhere('EXTRACT(YEAR FROM "details"."datetimeStart") = EXTRACT(YEAR FROM CURRENT_DATE)')
      .andWhere('appointment.state != :cancelled', { cancelled: 'CANCELADO' })
      .getRawOne();
    return result ? Number(result.total_turnos) : 0;
  }

  /////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  async getLastMonthAppointments(): Promise<number> {
    const result = await this.detailsAppointmentRepository
      .createQueryBuilder('details')
      .innerJoin('details.appointment', 'appointment')
      .select('COUNT(*)', 'total_turnos')
      .where('EXTRACT(MONTH FROM "details"."datetimeStart") = EXTRACT(MONTH FROM CURRENT_DATE) - 1')
      .andWhere('EXTRACT(YEAR FROM "details"."datetimeStart") = EXTRACT(YEAR FROM CURRENT_DATE)')
      .andWhere('appointment.state != :cancelled', { cancelled: 'CANCELADO' })
      .getRawOne();
    return result ? Number(result.total_turnos) : 0;
  }

  /////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  async getThisWeekAppointments(): Promise<number> {
    const result = await this.detailsAppointmentRepository
      .createQueryBuilder('details')
      .innerJoin('details.appointment', 'appointment')
      .select('DATE_TRUNC(\'week\', "details"."datetimeStart")', 'semana')
      .addSelect('COUNT(*)', 'total_turnos')
      .where('"details"."datetimeStart" >= DATE_TRUNC(\'week\', CURRENT_DATE)')
      .andWhere('appointment.state != :cancelled', { cancelled: 'CANCELADO' })
      .groupBy('DATE_TRUNC(\'week\', "details"."datetimeStart")')
      .orderBy('semana')
      .limit(1)
      .getRawOne();
    return result ? result.total_turnos : 0;
  }

  /////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////

  async getAppointmentHistory(range: string): Promise<any> {
    let days;
    if (range === '90d') {
      days = 90;
    } else if (range === '30d') {
      days = 30;
    } else if (range === '7d') {
      days = 7;
    } else {
      throw new Error('Invalid range');
    }

    const todayEnd = endOfDay(new Date());

    const result = await this.detailsAppointmentRepository
      .createQueryBuilder('details')
      .innerJoin('details.appointment', 'appointment')
      .select('DATE_TRUNC(\'day\', "details"."datetimeStart")', 'fecha')
      .addSelect('COUNT(*)::int', 'total_turnos')
      .where(`"details"."datetimeStart" BETWEEN (NOW() AT TIME ZONE 'UTC') - INTERVAL '${days} days' AND :todayEnd`, { todayEnd })
      .andWhere('appointment.state != :cancelled', { cancelled: 'CANCELADO' })
      .groupBy('DATE_TRUNC(\'day\', "details"."datetimeStart")')
      .orderBy('fecha')
      .getRawMany();

    return result;
  }

  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  async getDatesStatistics(begin: string, end: string): Promise<any> {
    const endDate = end + ' 23:00:00';

    const result = await this.appointmentRepository
      .createQueryBuilder('appointments')
      .select('DATE_TRUNC(\'day\', "appointments"."datetimeStart")', 'fecha')
      .addSelect(`SUM(CASE WHEN "appointments"."state" = 'COMPLETADO' THEN 1 ELSE 0 END)::int`, 'total_completado')
      .addSelect(`SUM(CASE WHEN "appointments"."state" IN ('PENDIENTE', 'SEÑADO', 'ACTIVO') THEN 1 ELSE 0 END)::int`, 'total_pendiente_seniado_activo')
      .addSelect(`SUM(CASE WHEN "appointments"."state" IN ('MOROSO', 'INACTIVO', 'CANCELADO') THEN 1 ELSE 0 END)::int`, 'total_moroso_inactivo_cancelado')
      .where(`"datetimeStart" BETWEEN '${begin}' AND '${endDate}'`)
      .groupBy('DATE_TRUNC(\'day\', "appointments"."datetimeStart")')
      .orderBy('fecha')
      .getRawMany();

    const totals = await this.appointmentRepository
      .createQueryBuilder('appointments')
      .select(`SUM(CASE WHEN "appointments"."state" = 'COMPLETADO' THEN 1 ELSE 0 END)::int`, 'total_completado')
      .addSelect(`SUM(CASE WHEN "appointments"."state" IN ('PENDIENTE', 'SEÑADO', 'ACTIVO') THEN 1 ELSE 0 END)::int`, 'total_pendiente_seniado_activo')
      .addSelect(`SUM(CASE WHEN "appointments"."state" IN ('MOROSO', 'INACTIVO', 'CANCELADO') THEN 1 ELSE 0 END)::int`, 'total_moroso_inactivo_cancelado')
      .where(`"datetimeStart" BETWEEN '${begin}' AND '${endDate}'`)
      .getRawOne();

    return { result, totals };
  }

  //////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////
  async getPayMethodStatistics(begin: string, end: string): Promise<any> {
    const endDate = end + ' 23:00:00';

    const totals = await this.appointmentRepository
      .createQueryBuilder('appointments')
      .leftJoin('appointments.payments', 'payments')
      //.select(`SUM(CASE WHEN "payments"."status" = 'PENDIENTE' AND "appointments"."state" != 'CANCELADO' THEN 1 ELSE 0 END)::int`, 'total_pendiente_pago')
      .select(`SUM(CASE WHEN "payments"."amount" > 0 AND "payments"."payment_method" = 'EFECTIVO' THEN 1 ELSE 0 END)::int`, 'total_efectivo')
      .addSelect(`SUM(CASE WHEN "payments"."amount" > 0 AND "payments"."payment_method" = 'MERCADOPAGO' THEN 1 ELSE 0 END)::int`, 'total_mercadopago')
      .where(`"appointments"."datetimeStart" BETWEEN '${begin}' AND '${endDate}'`)
      .getRawOne();

    return { totals };
  }

  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  async getDelinquentClientStatistics(begin: string, end: string): Promise<any> {
    const result = await this.appointmentRepository

  }

  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  async getPerCategoryStatistics(begin: string, end: string): Promise<any> {
    // const endDate = endOfDay(new Date(end)).toISOString();
    const endDate = end + ' 23:00:00';
    // const result = await this.appointmentRepository
    //     .createQueryBuilder('appointments')
    //     .leftJoin('appointments.package', 'package')
    //     .leftJoin('package.services', 'services')
    //     .leftJoin('services.category', 'category')
    //     .select('DATE_TRUNC(\'day\', "appointments"."datetimeStart")', 'fecha')
    //     .addSelect('category.name', 'categoria')
    //     .addSelect('COUNT(*)::int', 'total_citas')
    //     .addSelect('SUM("appointments"."total")::float', 'total_ingresos')
    //     .where(`"appointments"."datetimeStart" BETWEEN '${begin}' AND '${endDate}'`)
    //     .andWhere(`"appointments"."state" NOT IN ('CANCELADO', 'INACTIVO')`)
    //     .groupBy('DATE_TRUNC(\'day\', "appointments"."datetimeStart"), category.name')
    //     .orderBy('fecha')
    //     .getRawMany();

    const totals = await this.appointmentRepository
      .createQueryBuilder('appointments')
      .leftJoin('appointments.package', 'package')
      .leftJoin('package.services', 'services')
      .leftJoin('services.category', 'category')
      .select('category.name', 'categoria')
      .addSelect('COUNT(*)::int', 'total_citas')
      .addSelect('SUM("appointments"."total")::float', 'total_ingresos')
      .where(`"appointments"."datetimeStart" BETWEEN '${begin}' AND '${endDate}'`)
      .andWhere(`"appointments"."state" NOT IN ('CANCELADO', 'INACTIVO')`)
      .groupBy('category.name')
      .getRawMany();

    return { totals };
  }

  ////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  async getPerProfessionalStatistics(begin: string, end: string): Promise<any> {
    const endDate = end + ' 23:00:00';
    // const result = await this.appointmentRepository
    //     .createQueryBuilder('appointments')
    //     .leftJoin('appointments.details', 'details')
    //     .leftJoin('details.employee', 'employee')
    //     .select('DATE_TRUNC(\'day\', "appointments"."datetimeStart")', 'fecha')
    //     .addSelect('employee.email', 'correo')
    //     .addSelect('CONCAT(employee.firstName, \' \', employee.lastName)', 'profesional')
    //     .addSelect('COUNT(*)::int', 'total_citas')
    //     .addSelect('SUM("appointments"."total")::float', 'total_ingresos')
    //     .where(`"appointments"."datetimeStart" BETWEEN '${begin}' AND '${endDate}'`)
    //     .andWhere(`"appointments"."state" NOT IN ('CANCELADO', 'INACTIVO')`)
    //     .groupBy('DATE_TRUNC(\'day\', "appointments"."datetimeStart"), employee.email, employee.firstName, employee.lastName')
    //     .orderBy('fecha')
    //     .getRawMany();

    const totals = await this.appointmentRepository
      .createQueryBuilder('appointments')
      .leftJoin('appointments.details', 'details')
      .leftJoin('details.employee', 'employee')
      .select('employee.email', 'correo')
      .addSelect('CONCAT(employee.firstName, \' \', employee.lastName)', 'profesional')
      .addSelect('COUNT(*)::int', 'total_citas')
      .addSelect('SUM("appointments"."total")::float', 'total_ingresos')
      .where(`"appointments"."datetimeStart" BETWEEN '${begin}' AND '${endDate}'`)
      .andWhere(`"appointments"."state" NOT IN ('CANCELADO', 'INACTIVO')`)
      .groupBy('employee.email, employee.firstName, employee.lastName')
      .getRawMany();

    return { totals };
  }

  ////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  async getPerDayStatistics(begin: string, end: string): Promise<any> {
    const endDate = end + ' 23:00:00';

    // Obtener los días abiertos desde la configuración del sistema
    const config = await this.configService.getSystemConfig();
    const openDays = config.openDays;

    // Crear una estructura para almacenar los resultados, incluyendo los días con 0 citas
    const daysOfWeek = [
      { day: 'Sunday', count: 0 },
      { day: 'Monday', count: 0 },
      { day: 'Tuesday', count: 0 },
      { day: 'Wednesday', count: 0 },
      { day: 'Thursday', count: 0 },
      { day: 'Friday', count: 0 },
      { day: 'Saturday', count: 0 },
    ];

    // Filtrar los días abiertos
    const openDaysOfWeek = daysOfWeek.filter(day => openDays.includes(DaysOfWeek[day.day.toUpperCase() as keyof typeof DaysOfWeek]));

    // Realizar la consulta para obtener la cantidad de detalles de turno por día
    const result = await this.appointmentRepository
      .createQueryBuilder('appointments')
      .leftJoin('appointments.details', 'details')
      .select('DATE_TRUNC(\'day\', "appointments"."datetimeStart")', 'fecha')
      .addSelect('COUNT(details.id)::int', 'total_detalles')
      .where(`"appointments"."datetimeStart" BETWEEN '${begin}' AND '${endDate}'`)
      .andWhere(`"appointments"."state" NOT IN ('CANCELADO', 'INACTIVO')`)
      .groupBy('DATE_TRUNC(\'day\', "appointments"."datetimeStart")')
      .orderBy('fecha')
      .getRawMany();

    // Combinar los resultados de la consulta con la estructura inicial
    result.forEach(row => {
      const dayOfWeek = format(new Date(row.fecha), 'EEEE');
      const day = openDaysOfWeek.find(d => d.day === dayOfWeek);
      if (day) {
        day.count += row.total_detalles;
      }
    });

    return openDaysOfWeek;
  }



  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  async update(params: { id: number; body: AppointmentDto }): Promise<Appointment> {
    try {
      const { id, body } = params;
      const appointment = await this.appointmentRepository.findOne({
        where: { id: id },
        relations: ['details', 'details.employee', 'details.workstation', 'details.service', 'client', 'package', 'package.services', 'package.services.category', 'payments'],
      });
      if (!appointment) {
        throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
      }

      Object.assign(appointment, body);
      return await this.appointmentRepository.save(appointment);
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  async rearrange(params: { id: number; body: AppointmentDto }) {
    try {

      // Verifica si el body tiene package
      if (params.body.package) {
        const packageId = params.body.package.id;
        const pkg = await this.packageRepository.findOne({ where: { id: packageId }, relations: ['services', 'services.category'] });

        let body2 = new AppointmentDto();
        body2.package = pkg;
        await this.update({ id: params.id, body: body2 });
      }


      let body = params.body;
      const appointment = await this.appointmentRepository.findOne({
        where: { id: params.id },
        relations: ['package', 'package.services', 'package.services.category', 'details', 'details.service', 'details.service.category'],
      });
      const isAvailable = await this.isPackageAssignable(appointment.package.id, body.datetimeStart);
      if (!isAvailable) {
        throw new HttpException('Package is not available', HttpStatus.BAD_REQUEST);
      }

      // Calcular la nueva datetimeEnd
      const newDatetimeEnd = addMinutes(
        new Date(body.datetimeStart),
        appointment.package.services.reduce((total, service) => total + service.duration, 0)
      );

      // Actualizar el body con la nueva datetimeEnd
      body.datetimeEnd = newDatetimeEnd;

      await this.update({ id: params.id, body: params.body });

      // actualiza el datetimeStart del correspondiente detail
      for (const detail of appointment.details) {
        // Busca los profesionales y estaciones disponibles para el servicio
        let datas = new DetailsAppointmentDto();
        datas.datetimeStart = body.datetimeStart;
        datas.service = detail.service;
        const { selectedProfessional, selectedWorkstation } = await this.verifyProfessionalsWorkstations(datas);

        // Asigna uno random de los disponibles
        const randomIndexEmployee = Math.floor(Math.random() * selectedProfessional.length);
        const employee = selectedProfessional[randomIndexEmployee];

        if (selectedWorkstation.length === 0) {
          throw new Error('No hay estaciones de trabajo disponibles.');
        }

        const randomIndexStation = Math.floor(Math.random() * selectedWorkstation.length);
        const workstation = selectedWorkstation[randomIndexStation];

        if (!employee || !workstation) {
          throw new Error('Profesional o estación de trabajo inválidos en reacomodamiento.');
        }

        if (!employee.id) {
          throw new Error('El empleado seleccionado no tiene un ID válido.');
        }

        if (!workstation.id) {
          throw new Error('La estación de trabajo seleccionada no tiene un ID válido.');
        }

        // Guarda el detalle de la cita
        detail.employee = employee;
        detail.workstation = workstation;
        detail.datetimeStart = new Date(body.datetimeStart);
        await this.detailsAppointmentRepository.save(detail);
      }

      // Ahora se calcula a quienes se le puede recomendar la cita
      await this.notifyClientsForReappointments(appointment);

    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
