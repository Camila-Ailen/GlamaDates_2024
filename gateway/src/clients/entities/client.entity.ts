import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import {City} from '@/cities/entities/city.entity';

@Entity('clients')
@Unique(['cuil'])
@Unique(['document_number'])
export class Client {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => City, (city) => city.clients)
    city: City;

    @Column({length: 255})
    name: string;

    @Column({length: 255})
    last_name: string;

    @Column({length: 255})
    cuil: string;

    @Column({length: 255})
    document_type: string;

    @Column({length: 255})
    document_number: string;

    @Column({type: 'date'})
    birthdate: Date;

    @Column({length: 255})
    residence: string;

    @Column({length: 255})
    residence_number: string;

    @Column({length: 255, nullable: true})
    floor: string;

    @Column({length: 255, nullable: true})
    department: string;

    @Column({length: 255})
    gender: string;

    @Column({length: 255})
    email: string;

    @Column({length: 255})
    phone: string;

    @Column({length: 255})
    zip_code: string;

    @Column({length: 255})
    occupation: string;

    @Column({length: 255, default: 'SI'})
    dependency: string;

    @Column({length: 255, nullable: true})
    account_number: string;

    @Column({length: 255, nullable: true})
    cbu: string;

    @Column({length: 255, nullable: true})
    credit_card: string;

    @Column({length: 255, nullable: true})
    civil_status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

    @Column({length: 255, nullable: true})
    prefix: string;
}
