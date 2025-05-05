import { forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Payment } from "./entities/payment.entity";
import { IsNull, Repository } from "typeorm";
import { PaymentDto } from "./dto/payment.dto";
import { PaymentStatus } from "./entities/payment-status.enum";
import { AppointmentService } from "@/appointment/appointment.service";
import { MercadopagoService } from "@/mercadopago/mercadopago.service";
import { PaymentMethod } from "./entities/payment-method.enum";
import { AppointmentModule } from "@/appointment/appointment.module";
import { AppointmentState } from "@/appointment/entities/appointment-state.enum";


@Injectable()
export class PaymentService {
    @Inject((forwardRef(() => AppointmentService)))
    private appointmentService: AppointmentService;

    constructor(private mercadopagoService: MercadopagoService) { }

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>;


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
        // console.log("appointmentDto: ", appointmentDto);
        await this.appointmentService.update({ id: appointment.id, body: appointmentDto });

        
        // const amount = appointment.package.services.reduce((total, service) => total + service.price, 0);

        payment.datetime = new Date();
        payment.amount = amount;
        payment.status = PaymentStatus.COMPLETED;
        payment.transactionId = paymentId;
        payment.paymentMethod = PaymentMethod.MERCADOPAGO;

        await this.paymentRepository.save(payment);
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

}