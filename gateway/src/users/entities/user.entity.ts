import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, instanceToPlain } from 'class-transformer';
import { Role } from '@/roles/entities/role.entity';
import { Category } from '@/category/entities/category.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name', type: 'varchar', length: 255 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  //fecha de nacimiento
  @Column({ type: 'date', nullable: true })
  birthdate: Date | null;

  //genero
  @Column({ type: 'varchar', length: 255, nullable: true })
  gender: string | null;

  //telefono
  @Column({ type: 'varchar', length: 255, nullable: true })
  phone: string | null;

  @Column({ name: 'email_token', type: 'varchar', length: 32, nullable: true })
  @Exclude()
  emailToken: string | null;

  @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
  @Exclude()
  emailVerifiedAt: Date | null;

  @Column({
    name: 'email_change',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @Exclude()
  emailChange: string | null;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @Column({
    name: 'remember_token',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  @Exclude()
  rememberToken: string | null;

  // Mantenemos el campo pero sin la restricción FK por ahora
  @Column({ name: 'branch_office_id', type: 'bigint', nullable: true })
  branchOfficeId: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  @Exclude()
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  @Exclude()
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  @Exclude()
  deletedAt: Date | null;

  @ManyToOne(() => Role, (role) => role.users, {
    nullable: true,
  })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ManyToMany(() => Category, (category) => category.users)
  categories: Category[];

  toJSON() {
    return instanceToPlain(this);
  }
}
