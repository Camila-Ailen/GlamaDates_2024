import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Payment } from "./entities/payment.entity";
import { IsNull, Repository } from "typeorm";
import { PaymentDto } from "./dto/payment.dto";


@Injectable()
export class PaymentService {
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

}