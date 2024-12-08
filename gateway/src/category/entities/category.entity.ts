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
import { Service } from '@/service/entities/service.entity';
import { Workstation } from '@/workstation/entities/workstation.entity';
  
  @Entity({ name: 'categories' })
  export class Category {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 45, nullable: false })
    name: string;
  
    @Column({ type: 'varchar', length: 200, nullable: true })
    description?: string;
  
    @ManyToMany(() => User, (user) => user.categories)
    @JoinTable()
    users: User[];

    @OneToMany(() => Service, (service) => service.category)
    services: Service[];

    @ManyToMany(() => Workstation, (workstation) => workstation.categories)
    workstations: Workstation[];

  
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
   