import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Exclude, instanceToPlain } from 'class-transformer';
import { WorkstationState } from './workstation-state.enum';
import { Category } from '@/category/entities/category.entity';
import { Appointment } from '@/appointment/entities/appointment.entity';
import { DetailsAppointment } from '@/details-appointment/entities/details-appointment.entity';
  
  @Entity({ name: 'workstations' })
  export class Workstation {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 45, nullable: false })
    name: string;
  
    @Column({ type: 'varchar', length: 200, nullable: true })
    description?: string;

    @Column({ type: 'enum', enum: WorkstationState, default: WorkstationState.ACTIVE })
    state: WorkstationState;

    @JoinTable()
    @ManyToMany(() => Category, (category) => category.workstations)
    categories: Category[];

    @OneToMany(() => DetailsAppointment, (detailsAppointment) => detailsAppointment.workstation)
    detailsAppointment: DetailsAppointment[];
  
  
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
  