import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PaymentMethod } from "./payment-method.enum";
import { PaymentType } from "./payment-type.enum";
import { Exclude, instanceToPlain } from "class-transformer";
import { Appointment } from "@/appointment/entities/appointment.entity";



@Entity({ name: 'payments' })
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'datetime', type: 'timestamp', nullable: true })
    datetime: Date | null;

    @Column({ name: 'amount', type: 'float', default: 0, nullable: true })
    amount: number;

    @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
    paymentMethod: PaymentMethod;

    @Column({ name: 'payment_type', type: 'enum', enum: PaymentType, default: PaymentType.TOTAL })
    paymentType: PaymentType;

    @Column({ name: 'observation', type: 'varchar', length: 255 })
    observation: string;

    @Column({ name: 'transaction_id', type: 'varchar', length: 255 })
    transactionId: string;

    // Relacion con turno
    @ManyToOne(() => Appointment, (appointment) => appointment.payments, { 
        nullable: false
    })
    appointment: Appointment;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
    @Exclude()
    createdAt: Date | null;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
    @Exclude()
    updatedAt: Date | null;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    @Exclude()
    deletedAt: Date | null;

    toJSON() {
          return instanceToPlain(this);
        }
}