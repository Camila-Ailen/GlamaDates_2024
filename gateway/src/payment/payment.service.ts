import { forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Payment } from "./entities/payment.entity";
import { IsNull, Not, Repository } from "typeorm";
import { PaymentDto } from "./dto/payment.dto";
import { PaymentStatus } from "./entities/payment-status.enum";
import { AppointmentService } from "@/appointment/appointment.service";
import { MercadopagoService } from "@/mercadopago/mercadopago.service";
import { PaymentMethod } from "./entities/payment-method.enum";
import { MailerService } from "@/mailer/mailer.service";
import { AppointmentModule } from "@/appointment/appointment.module";
import { AppointmentState } from "@/appointment/entities/appointment-state.enum";
import { PaginationPaymentDto } from "./dto/pagination-payment.dto";
import { PaginationResponseDTO } from "@/base/dto/base.dto";
import * as path from "path";
import * as fs from 'fs';
import { PdfService } from "@/mailer/pdf/pdf.service";


@Injectable()
export class PaymentService {
    @Inject((forwardRef(() => AppointmentService)))
    private appointmentService: AppointmentService;

    constructor(
        private mercadopagoService: MercadopagoService,

        private readonly mailerService: MailerService,
        private readonly pdfService: PdfService,

    ) { }

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>;


    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    async findAll(params: {
        query: PaginationPaymentDto;
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

            const [payments, total] = await this.paymentRepository.findAndCount({
                where: {
                    deletedAt: IsNull(),
                    datetime: Not(IsNull())
                },
                relations: ['appointment'],
                order,
                take: forPage,
                skip,
            });

            return {
                total: total,
                pageSize: forPage,
                offset: params.query.offset,
                results: payments,
            };
        } catch (error) {
            console.error(error);
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }

    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    async cancelPayment(paymentId: number, observation: string): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId, deletedAt: IsNull() },
            relations: ['appointment'],
        });
        if (!payment) throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);

        payment.status = PaymentStatus.CANCELLED;
        payment.datetime = new Date();
        payment.observation = observation;
        await this.paymentRepository.save(payment);

        // Send cancellation email
        await this.sendPaymentCancellationEmail(paymentId, observation);
        return payment;
    }
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    async create(params: { body: PaymentDto }): Promise<Payment> {
        await this.paymentRepository.save(
            this.paymentRepository.create({
                ...params.body,
                createdAt: new Date(),
            }),
        );
        return await this.paymentRepository.findOne({
            where: { id: params.body.id },
            relations: ['appointment'],
        });
    }
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    async update(params: { id: number; body: PaymentDto }): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({
            where: { id: params.id, deletedAt: IsNull() },
        });
        if (!payment) throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);

        this.paymentRepository.merge(payment, params.body);
        await this.paymentRepository.save(payment);
        return await this.paymentRepository.findOne({
            where: { id: params.id, deletedAt: IsNull() },
            relations: ['appointment'],
        });
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    async findFromAppointmentId(appointmentId: number): Promise<number> {
        const payment = await this.paymentRepository.findOne({
            where: { appointment: { id: appointmentId } },
            relations: ['appointment'],
        });
        if (!payment) throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
        return payment.id;
    }

    /////////////////////////////////////////////////
    ////////////////////////////////////////////////
    async existsByTransaction(id: string): Promise<Boolean> {
        const payment = await this.paymentRepository.findOne({
            where: {
                transactionId: id,
                deletedAt: IsNull()
            },
        });
        if (!payment) {
            return false;
        } else {
            return true;
        }
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    async confirm(paymentData) {

        const paymentUrl = paymentData.paymentUrl;
        const paymentId = paymentData.paymentId;

        const payment = await this.paymentRepository.findOne({
            where: { paymentURL: paymentUrl },

            relations: ['appointment']

        });

        if (!payment) {
            throw new Error("Payment not found");
        }

        const appointment = await this.appointmentService.getById(payment.appointment.id);

        if (!appointment) {
            throw new Error("Appointment not found");
        }

        const amount = appointment.pending;

        appointment.state = AppointmentState.ACTIVE;
        appointment.pending = 0;
        const appointmentDto = {
            ...appointment,
            created_at: appointment.createdAt,
            updated_at: appointment.updatedAt,
            deleted_at: appointment.deletedAt,
        };
        await this.appointmentService.update({ id: appointment.id, body: appointmentDto });


        // const amount = appointment.package.services.reduce((total, service) => total + service.price, 0);

        payment.datetime = new Date();
        payment.amount = amount;
        payment.status = PaymentStatus.COMPLETED;
        payment.transactionId = paymentId;
        payment.paymentMethod = PaymentMethod.MERCADOPAGO;

        await this.paymentRepository.save(payment);

        // Envía el comprobante de pago por email con PDF adjunto
        await this.sendPaymentConfirmationEmailWithPdf(payment.id);
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    async getPaymentUrl(appointmentId: number): Promise<string> {
        const payment = await this.paymentRepository.findOne({ where: { appointment: { id: appointmentId } } });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return payment.paymentURL;
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // mail por cancelacion de pago
    async sendPaymentCancellationEmail(paymentId: number, cancellationReason: string): Promise<void> {
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId },
            relations: ['appointment', 'appointment.client', 'appointment.details', 'appointment.package'],
        });

        if (!payment) {
            throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
        }

        const appointment = payment.appointment;
        const client = appointment.client;
        const serviceName = appointment.package?.name || 'N/A';
        const paymentDate = payment.datetime
            ? new Date(payment.datetime).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'N/A';
        const paymentAmount = payment.amount || 0;
        const paymentMethod = payment.paymentMethod || 'N/A';
        const appointmentDate = appointment.datetimeStart
            ? new Date(appointment.datetimeStart).toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
            : 'N/A';
        const cancellationDate = new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const bookingLink = `${process.env.FRONTEND_URL || 'https://glamadates.com'}/catalog`;

        // Carga la plantilla
        const emailTemplatePath = path.join(__dirname, '../mailer/templates/payment-cancellation-email.html');
        let emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

        // Reemplaza los placeholders
        emailTemplate = emailTemplate.replace('${clientName}', `${client.firstName} ${client.lastName}`);
        emailTemplate = emailTemplate.replace('${paymentId}', payment.id.toString());
        emailTemplate = emailTemplate.replace('${paymentDate}', paymentDate);
        emailTemplate = emailTemplate.replace('${paymentAmount}', paymentAmount.toString());
        emailTemplate = emailTemplate.replace('${paymentMethod}', paymentMethod);
        emailTemplate = emailTemplate.replace('${serviceName}', serviceName);
        emailTemplate = emailTemplate.replace('${appointmentDate}', appointmentDate);
        emailTemplate = emailTemplate.replace('${cancellationDate}', cancellationDate);
        emailTemplate = emailTemplate.replace('${cancellationReason}', cancellationReason || payment.observation || 'No especificado');
        emailTemplate = emailTemplate.replace('${bookingLink}', bookingLink);

        // Envía el mail
        await this.mailerService.sendEmail(
            'info@glamadates.com',
            'Cancelación de Pago',
            [client.email],
            emailTemplate
        );
    }

    // Enviar email de confirmación de pago con PDF adjunto
    async sendPaymentConfirmationEmailWithPdf(paymentId: number): Promise<void> {
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId },
            relations: ['appointment', 'appointment.client', 'appointment.details', 'appointment.details.employee', 'appointment.package'],
        });

        if (!payment) {
            throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
        }

        const appointment = payment.appointment;
        const client = appointment.client;
        const serviceName = appointment.package?.name || 'N/A';
        const paymentDate = payment.datetime
            ? new Date(payment.datetime).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'N/A';
        const paymentAmount = payment.appointment.total || 0;
        const paymentMethod = payment.paymentMethod || 'N/A';
        const appointmentDate = appointment.datetimeStart
            ? new Date(appointment.datetimeStart).toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
            : 'N/A';
        const appointmentTime = appointment.datetimeStart
            ? new Date(appointment.datetimeStart).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            : 'N/A';
        const serviceDuration = appointment.details[0]?.durationNow || 'N/A';
        const professionalName = appointment.details[0]?.employee.firstName && appointment.details[0]?.employee.firstName || 'N/A';
        const transactionId = payment.transactionId || payment.id.toString();

        // Genera el PDF
        const pdfBuffer = await this.pdfService.generatePaymentReceiptPdf({
            clientName: `${client.firstName} ${client.lastName}`,
            transactionId,
            paymentDate,
            paymentAmount,
            paymentMethod,
            serviceName,
            appointmentDate,
            appointmentTime,
            serviceDuration: serviceDuration.toString(),
            professionalName: `${appointment.details[0].employee.firstName} ${appointment.details[0].employee.lastName}`,
            discountAmount: payment.appointment.discount || 0,
        });

        // Carga la plantilla de email
        const emailTemplatePath = path.join(__dirname, '../mailer/templates/payment-confirmation-email.html');
        let emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

        // Reemplaza los placeholders
        emailTemplate = emailTemplate.replace('{{clientName}}', client.firstName + ' ' + client.lastName);
        emailTemplate = emailTemplate.replace('{{receiptNumber}}', transactionId);
        emailTemplate = emailTemplate.replace('{{paymentDate}}', paymentDate);
        emailTemplate = emailTemplate.replace('{{paymentAmount}}', paymentAmount.toString());
        emailTemplate = emailTemplate.replace('{{paymentMethod}}', paymentMethod);
        emailTemplate = emailTemplate.replace('{{serviceName}}', serviceName);
        emailTemplate = emailTemplate.replace('{{appointmentDate}}', appointmentDate);
        emailTemplate = emailTemplate.replace('{{appointmentTime}}', appointmentTime);
        emailTemplate = emailTemplate.replace('{{serviceDuration}}', serviceDuration.toString());
        emailTemplate = emailTemplate.replace('{{professionalName}}', professionalName);
        emailTemplate = emailTemplate.replace('{{viewAppointmentLink}}', `${process.env.FRONTEND_URL || 'https://glamadates.com'}/appointments`);

        // Envía el correo con el PDF adjunto
        await this.mailerService.transporter.sendMail({
            from: 'info@glamadates.com',
            to: client.email,
            subject: 'Pago Confirmado - GlamaDates',
            html: emailTemplate,
            attachments: [
                {
                    filename: `Comprobante-Pago-${transactionId}.pdf`,
                    content: pdfBuffer,
                },
            ],
        });
    }

}