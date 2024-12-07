import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import {City} from '@/cities/entities/city.entity';

@Entity('states')
export class State {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({length: 255})
    name: string;

    @OneToMany(() => City, city => city.state)
    cities: City[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
