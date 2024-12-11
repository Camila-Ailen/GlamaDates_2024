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
  
  @Entity({ name: 'appointments' })
  export class Appointment {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'date', nullable: true })
    datetimeStart: Date | null;

    @Column({ type: 'date', nullable: true })
    datetimeEnd: Date | null;

    @Column({ type: 'enum', enum: AppointmentState, default: AppointmentState.ACTIVE })
    state: AppointmentState;

    // Relacion con cliente
    @ManyToOne(() => User, (client) => client.appointmentClient, {
        nullable: false,
    })
    client: User;

    // Relacion con paquetes
    @ManyToOne(() => Package, (pkg) => pkg.appointment, {
        nullable: false,
    })
    package: Package[];

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
  