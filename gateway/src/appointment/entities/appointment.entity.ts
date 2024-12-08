import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Exclude, instanceToPlain } from 'class-transformer';
import { AppointmentState } from './appointment-state.enum';
import { User } from '@/users/entities/user.entity';
import { Package } from '@/package/entities/package.entity';
import { Workstation } from '@/workstation/entities/workstation.entity';
  
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

    // // Relacion con cliente
    // @ManyToOne(() => User, (client) => client.appointments, {
    //     nullable: false,
    // })
    // client: User;

    // // Relacion con empleado
    // @ManyToOne(() => User, (employee) => employee.appointments, {
    //     nullable: false,
    // })
    // employee: User;

    // // Relacion con paquetes
    // @ManyToMany(() => Package, (pkg) => pkg.appointments, {
    //     nullable: false,
    // })
    // packages: Package[];

    // // Relacion con estaciones de trabajo
    // @ManyToMany(() => Workstation, (station) => station.appointments, {
    //     nullable: false,
    // })
    // stations: Workstation[];
    
  
  
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
  