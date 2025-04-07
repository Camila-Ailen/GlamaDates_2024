import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auditoria } from './entities/auditoria.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepo: Repository<Auditoria>,
    private readonly dataSource: DataSource,
  ) {}

  async create(data: {
    userId: number | null;
    entity: string;
    idEntity?: number | string;
    accion: string;
    description?: string;
    oldData?: any;
    newData?: any;
  }) {
    const auditoria = this.auditoriaRepo.create(data);
    await this.auditoriaRepo.save(auditoria);
  }

  getRepositoryForEntity(entity: string): Repository<any> | null {
    try {
      const repo = this.dataSource.getRepository(entity);
      return repo;
    } catch (e) {
      return null;
    }
  }

  async findAll() {
    return this.auditoriaRepo.find({
      order: { date: 'DESC' },
    });
  }
  
}
