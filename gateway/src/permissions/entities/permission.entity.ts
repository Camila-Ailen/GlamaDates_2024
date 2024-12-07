import {
    Column,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Role } from '@/roles/entities/role.entity';

  @Entity({ name: 'Permissions' })
  export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 45, nullable: false })
    permission: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    description?: string;

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];

  }
