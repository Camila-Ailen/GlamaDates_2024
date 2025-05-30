import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { WorkstationDto } from './dto/workstation.dto';
import { PaginationWorkstationDto } from './dto/pagination-workstation.dto';
import { Workstation } from './entities/workstation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { WorkstationState } from './entities/workstation-state.enum';
import { PaginationResponseDTO } from '@/base/dto/base.dto';
import { CategoryService } from '@/category/category.service';
import { Category } from '@/category/entities/category.entity';

@Injectable()
export class WorkstationService {
  constructor(
    @InjectRepository(Workstation)
    private readonly workstationRepository: Repository<Workstation>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

  ) { }

  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  async create(params: { body: WorkstationDto }): Promise<Workstation> {
    // Validar si ya existe una workstation con el mismo nombre
    if (
      await this.workstationRepository.findOneBy({
        name: params.body.name,
      })
    ) {
      throw new HttpException('Workstation already exists', HttpStatus.CONFLICT);
    }

    if (params.body.categories && params.body.categories.length > 0) {
      const categories = await this.categoryRepository.find({
        where: { id: In(params.body.categories) },
      });
      params.body.categories = categories;
    }

    // Crear y guardar la workstation
    await this.workstationRepository.save(
      this.workstationRepository.create({
        ...params.body,
        createdAt: new Date(),
      }),
    );

    // Retornar la workstation recién creada con las relaciones
    return await this.workstationRepository.findOne({
      where: { name: params.body.name },
      relations: ['categories'],
    });
  }

  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  async findAll(params: { query: PaginationWorkstationDto }): Promise<PaginationResponseDTO> {
    const {
      offset = 0,
      pageSize = 10,
      orderBy = 'id',
      orderType = 'ASC',
    } = params.query;

    try {
      const [results, total] = await this.workstationRepository.findAndCount({
        relations: ['categories'],
        skip: offset,
        take: pageSize,
        order: {
          [orderBy]: orderType,
        },
      });

      return {
        total,
        pageSize,
        offset,
        results,
      };
    } catch (error) {
      throw new Error(`${WorkstationService.name}[findAll]:${error.message}`);
    }
  }

  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  async findOne(id: number): Promise<Workstation> {
    const workstation = await this.workstationRepository.findOne({
      where: { id },
      relations: ['categories'],
    });
    if (!workstation) {
      throw new HttpException('Workstation not found', HttpStatus.NOT_FOUND);
    }
    return workstation;
  }

  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  async update(id: number, body: WorkstationDto): Promise<Workstation> {
    const workstation = await this.workstationRepository.findOne({
      where: { id },
      relations: ['categories'],
    });
    if (!workstation) {
      throw new HttpException('Workstation not found', HttpStatus.NOT_FOUND);
    }

    if (body.categories && body.categories.length > 0) {
      const categories = await this.categoryRepository.find({
        where: { id: In(body.categories) },
      });
      workstation.categories = categories;
    }
    this.workstationRepository.merge(workstation, body);
    workstation.updatedAt = new Date();
    await this.workstationRepository.save(workstation);
    return await this.workstationRepository.findOne({
      where: { id: id },
      relations: ['categories'],
    });
  }

  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  async remove(id: number): Promise<Workstation> {
    const workstation = await this.workstationRepository.findOne({ where: { id } });
    if (!workstation) {
      throw new HttpException('Workstation not found', HttpStatus.NOT_FOUND);
    }
    workstation.state = WorkstationState.DELETED; // O WorkstationState.ELIMINADO si usas enum
    return await this.workstationRepository.save(workstation);
  }
}
