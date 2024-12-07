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
import { User } from '@/users/entities/user.entity';
import { Permission } from '@/permissions/entities/permission.entity';
import { Exclude, instanceToPlain } from 'class-transformer';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 45, nullable: false })
  role: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description?: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable()
  permissions: Permission[];

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
