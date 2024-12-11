import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Exclude, instanceToPlain } from 'class-transformer';
import { Category } from '@/category/entities/category.entity';
import { Package } from '@/package/entities/package.entity';
import { DetailsAppointment } from '@/details-appointment/entities/details-appointment.entity';

@Entity('services')
export class Service {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 255 })
    name: string;

    @Column({ name: 'description', type: 'varchar', length: 255 })
    description: string;

    @Column({ type: 'float', nullable: false })
    price: number;

    @Column({ type: 'int', nullable: false })
    duration: number;

    // Relacion con categorias
    @ManyToOne(() => Category, (category) => category.services, {
        nullable: false,
    })
    category: Category;

    // Relacion con paquetes
    @ManyToMany(() => Package, (pkg) => pkg.services)
    packages: Package[];

    // Relacion con detalles de turnos
    @OneToMany(() => DetailsAppointment, (details) => details.service)
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
