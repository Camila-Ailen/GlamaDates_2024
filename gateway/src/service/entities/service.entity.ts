import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Exclude, instanceToPlain } from 'class-transformer';
  import { Category } from '@/category/entities/category.entity';
  
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

    @ManyToOne(() => Category, (category) => category.services, {
        nullable: false,
    })
    // @JoinColumn({ name: 'category_id' })
    category: Category;

  
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
  