import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { WorkstationDto } from './dto/workstation.dto';
import { PaginationWorkstationDto } from './dto/pagination-workstation.dto';
import { Workstation } from './entities/workstation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkstationState } from './entities/workstation-state.enum';
import { PaginationResponseDTO } from '@/base/dto/base.dto';

@Injectable()
export class WorkstationService {
  constructor(
    @InjectRepository(Workstation)
    private readonly workstationRepository: Repository<Workstation>,
  ) { }

  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  async create(params: { body: WorkstationDto }): Promise<Workstation> {
    try {
      const workstation = this.workstationRepository.create(params.body);
      return await this.workstationRepository.save(workstation);
    } catch (error) {
      throw new Error(`${WorkstationService.name}[create]:${error.message}`);
    }
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

    // Actualiza los campos
    Object.assign(workstation, body);

    // Guarda los cambios
    return await this.workstationRepository.save(workstation);
  }

  /////////////////////////////////////////////////
  /////////////////////////////////////////////////
  async remove(id: number): Promise<Workstation> {
    const workstation = await this.workstationRepository.findOne({ where: { id } });
    if (!workstation) {
      throw new HttpException('Workstation not found', HttpStatus.NOT_FOUND);
    }
    await this.workstationRepository.softDelete(id);
    // Retorna la workstation con withDeleted para confirmar el borrado
    return await this.workstationRepository.findOne({ where: { id }, withDeleted: true });
  }
}
