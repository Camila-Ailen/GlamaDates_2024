import { Exclude, instanceToPlain } from 'class-transformer';
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn
} from 'typeorm';
import { DaysOfWeek } from './DaysOfWeek.enum';

@Entity('system_config')
export class SystemConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 30 }) // Intervalo entre turnos en minutos
  intervalMinutes: number;

  @Column({ default: 30 }) // Días máximos para reservar en adelante
  maxReservationDays: number;

  @Column({ type: 'time', nullable: true }) // Apertura turno 1
  openingHour1: string;

  @Column({ type: 'time', nullable: true }) // Cierre turno 1
  closingHour1: string;

  @Column({ type: 'time', nullable: true }) // Apertura turno 2 (opcional)
  openingHour2: string;

  @Column({ type: 'time', nullable: true }) // Cierre turno 2 (opcional)
  closingHour2: string;

  @Column({ 
    type: 'enum',
    enum: DaysOfWeek,
    array: true,
    default: [DaysOfWeek.LUNES, DaysOfWeek.MARTES, DaysOfWeek.MIERCOLES, DaysOfWeek.JUEVES, DaysOfWeek.VIERNES]
  })
  openDays: DaysOfWeek[];


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
