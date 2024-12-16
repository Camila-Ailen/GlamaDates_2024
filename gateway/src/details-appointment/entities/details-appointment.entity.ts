import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Exclude, instanceToPlain } from 'class-transformer';
import { User } from '@/users/entities/user.entity';
import { Workstation } from '@/workstation/entities/workstation.entity';
import { Service } from '@/service/entities/service.entity';
import { Appointment } from '@/appointment/entities/appointment.entity';
  
  @Entity({ name: 'details_appointments' })
  export class DetailsAppointment {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'float', nullable: false })
    priceNow: number;

    @Column({ type: 'int', nullable: false })
    durationNow: number;

    @Column({ type: 'timestamp', nullable: true })
    datetimeStart: Date | null;

    // Relacion con turno
    @ManyToOne(() => Appointment, (appointment) => appointment.details, {
        nullable: false,
    })
    appointment: Appointment;

    // Relacion con empleado
    @ManyToOne(() => User, (employee) => employee.detailsAppointmentEmployee, {
        nullable: false,
    })
    employee: User;

    // Relacion con servicios
    @ManyToOne(() => Service, (service) => service.details, {
        nullable: false,
    })
    service: Service;

    // Relacion con estaciones de trabajo
    @ManyToOne(() => Workstation, (station) => station.detailsAppointment, {
        nullable: false,
    })
    workstation: Workstation;
    
  
  
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
  