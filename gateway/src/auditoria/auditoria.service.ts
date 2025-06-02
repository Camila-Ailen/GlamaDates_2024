import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auditoria } from './entities/auditoria.entity';
import { Repository, DataSource } from 'typeorm';
import { AuditsPaginationDto } from './dto/pagination-audits.dto';
import { PaginationResponseDTO } from '@/base/dto/base.dto';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepo: Repository<Auditoria>,
    private readonly dataSource: DataSource,
  ) { }

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

  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async all(params: {
    query: AuditsPaginationDto;
  }): Promise<PaginationResponseDTO> {
    const emptyResponse = {
      total: 0,
      pageSize: 0,
      offset: params.query.offset,
      results: [],
    };
    try {
      if (Object.keys(params.query).length === 0) {
        return emptyResponse;
      }
      if (params.query.pageSize?.toString() === '0') {
        return emptyResponse;
      }

      const query = this.auditoriaRepo.createQueryBuilder('audit');

      // Filtros según el DTO
      if (params.query.userId !== undefined) {
        if (params.query.userId === null) {
          query.andWhere('audit.userId IS NULL');
        } else {
          query.andWhere('audit.userId = :userId', { userId: params.query.userId });
        }
      }
      if (params.query.entity) {
        query.andWhere('audit.entity ILIKE :entity', { entity: `%${params.query.entity}%` });
      }
      if (params.query.accion) {
        query.andWhere('audit.accion ILIKE :accion', { accion: `%${params.query.accion}%` });
      }
      if (params.query.description) {
        query.andWhere('audit.description ILIKE :description', { description: `%${params.query.description}%` });
      }

      // Ordenamiento
      if (params.query.orderBy && params.query.orderType) {
        query.orderBy(
          `audit.${params.query.orderBy}`,
          params.query.orderType.toUpperCase() as 'ASC' | 'DESC'
        );
      } else {
        query.orderBy('audit.date', 'DESC');
      }

      const forPage = params.query.pageSize
        ? parseInt(params.query.pageSize.toString(), 10) || 10
        : 10;
      const skip = params.query.offset || 0;

      const [audits, total] = await query
        .take(forPage)
        .skip(skip)
        .getManyAndCount();

      return {
        total,
        pageSize: forPage,
        offset: skip,
        results: audits,
      };
    } catch (error) {
      throw new Error(`${AuditoriaService.name}[all]:${error.message}`);
    }
  }

  async getFilterOptions() {
    const query = this.auditoriaRepo.createQueryBuilder('audit');

    // Obtener entidades únicas
    const entities = await query
      .select('DISTINCT audit.entity', 'entity')
      .getRawMany();

    // Obtener acciones únicas
    const actions = await query
      .select('DISTINCT audit.accion', 'accion')
      .getRawMany();

    // Obtener usuarios únicos
    const users = await query
      .select('DISTINCT audit.userId', 'userId')
      .getRawMany();

    return {
      entities: entities.map(e => e.entity),
      actions: actions.map(a => a.accion),
      users: users.map(u => u.userId),
    };
  }

}
