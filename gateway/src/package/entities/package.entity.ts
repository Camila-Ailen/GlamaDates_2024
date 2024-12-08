import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Exclude, instanceToPlain } from 'class-transformer';
  import { Service } from '@/service/entities/service.entity';
import { Appointment } from '@/appointment/entities/appointment.entity';
  
  @Entity('packages')
  export class Package {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: 'name', type: 'varchar', length: 255 })
    name: string;
  
    @Column({ name: 'description', type: 'varchar', length: 255 })
    description: string; 

    @JoinTable()
    @ManyToMany(() => Service, (services) => services.packages)
    services: Service[];

    @OneToMany(() => Appointment, (appointment) => appointment.package)
    appointment: Appointment[];

  
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
  