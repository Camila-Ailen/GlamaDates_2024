import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Exclude, instanceToPlain } from 'class-transformer';
import { AppointmentState } from './appointment-state.enum';
import { User } from '@/users/entities/user.entity';
import { Package } from '@/package/entities/package.entity';
import { Workstation } from '@/workstation/entities/workstation.entity';
import { DetailsAppointment } from '@/details-appointment/entities/details-appointment.entity';
import { Payment } from '@/payment/entities/payment.entity';
import { Max, Min } from 'class-validator';
import { DiscountType } from './discountTypes';
  
  @Entity({ name: 'appointments' })
  export class Appointment {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'timestamp', nullable: true })
    datetimeStart: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    datetimeEnd: Date | null;

    @Column({ type: 'enum', enum: AppointmentState, default: AppointmentState.ACTIVE })
    state: AppointmentState;

    // Tipo de descuento, despues toma el valor en config
    @Column({ type: 'enum', enum: DiscountType, default: DiscountType.NONE })
    discountType: DiscountType;

    //costo total sin contar el descuento
    @Column({ type: 'float', default: 0, nullable: true })
    total: number;

    //monto del descuento
    @Column({ type: 'float', default: 0, nullable: true })
    discount: number;

    //costo pendiente a pagar
    @Column({ type: 'float', default: 0, nullable: true })
    pending: number;

    // Relacion con cliente
    @ManyToOne(() => User, (client) => client.appointmentClient, {
        nullable: false,
    })
    client: User;

    // Relacion con paquetes
    @ManyToOne(() => Package, (pkg) => pkg.appointment, {
        nullable: false,
    })
    package: Package;

    // Relacion con pagos
    @OneToMany(() => Payment, payment => payment.appointment)
    payments: Payment[];


    // Relacion con detalles de turnos
    @OneToMany(() => DetailsAppointment, (details) => details.appointment)
    details: DetailsAppointment[];
    
  
  
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
  