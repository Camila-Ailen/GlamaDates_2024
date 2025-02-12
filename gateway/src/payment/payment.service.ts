import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Payment } from "./entities/payment.entity";
import { IsNull, Repository } from "typeorm";
import { PaymentDto } from "./dto/payment.dto";
import { PaymentStatus } from "./entities/payment-status.enum";
import { AppointmentService } from "@/appointment/appointment.service";
import { MercadopagoService } from "@/mercadopago/mercadopago.service";
import { PaymentMethod } from "./entities/payment-method.enum";


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
            relations: ['appointments'],
        });
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    async confirm(paymentData) {
        console.log("Datos recibidos en servicio de payment:", paymentData);

        const paymentUrl = paymentData.paymentUrl;
        const paymentId = paymentData.paymentId;

        const payment = await this.paymentRepository.findOne({
            where: { paymentURL: paymentUrl },

            relations: ['appointment']

        });

        if (!payment) {
            throw new Error("Payment not found");
        }

        console.log("payment: ", payment);

        const appointment = await this.appointmentService.getById(payment.appointment.id);

        if (!appointment) {
            throw new Error("Appointment not found");
        }

        const amount = appointment.package.services.reduce((total, service) => total + service.price, 0);

        payment.datetime = new Date();
        payment.amount = amount;
        payment.status = PaymentStatus.COMPLETED;
        payment.transactionId = paymentId;
        payment.paymentMethod = PaymentMethod.MERCADOPAGO;

        await this.paymentRepository.save(payment);
    }

}