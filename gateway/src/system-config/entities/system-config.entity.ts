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
import { Max, Min } from 'class-validator';

@Entity('system_config')
export class SystemConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 30, nullable: false }) // Intervalo entre turnos en minutos
  intervalMinutes: number;

  @Column({ default: 30, nullable: false }) // Días máximos para reservar en adelante
  maxReservationDays: number;

  @Column({ type: 'time', nullable: false }) // Apertura turno 1
  openingHour1: string;

  @Column({ type: 'time', nullable: false }) // Cierre turno 1
  closingHour1: string;

  @Column({ type: 'time', nullable: true }) // Apertura turno 2 (opcional)
  openingHour2: string;

  @Column({ type: 'time', nullable: true }) // Cierre turno 2 (opcional)
  closingHour2: string;

  @Column({ name: 'descount1', type: 'int', nullable: false, default: 0 })
  @Min(0)
  @Max(100)
  descountFull: number; // Descuento porcentual total (dia y hora)
  
  @Column({ name: 'descount2', type: 'int', nullable: false, default: 0 })
  @Min(0)
  @Max(100)
  descountPartial: number; // Descuento porcentual parcial (solo dia)

  @Column({ 
    type: 'enum',
    enum: DaysOfWeek,
    array: true,
    nullable: false,
    default: [DaysOfWeek.MONDAY, DaysOfWeek.TUESDAY, DaysOfWeek.WEDNESDAY, DaysOfWeek.THURSDAY, DaysOfWeek.FRIDAY]
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
