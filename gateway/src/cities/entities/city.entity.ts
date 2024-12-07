import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import {State} from '@/states/entities/state.entity';
import {Client} from '@/clients/entities/client.entity';

@Entity('cities')
export class City {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => State, state => state.cities)
    state: State;

    @Column({length: 255})
    name: string;

    @Column({length: 255})
    zip_code: string;

    @OneToMany(() => Client, client => client.city)
    clients: Client[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
