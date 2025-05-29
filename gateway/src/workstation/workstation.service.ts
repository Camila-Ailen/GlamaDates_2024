import { Injectable } from '@nestjs/common';
import { WorkstationDto } from './dto/workstation.dto';
import { PaginationWorkstationDto } from './dto/pagination-workstation.dto';
import { Workstation } from './entities/workstation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkstationState } from './entities/workstation-state.enum';

@Injectable()
export class WorkstationService {
  constructor(
    @InjectRepository(Workstation)
    private readonly workstationRepository: Repository<Workstation>,
  ) {}

  create(createWorkstationDto: WorkstationDto) {
    return 'This action adds a new workstation';
  }

  async findAll(): Promise<Workstation[]> {
      try {
        const workstation = await this.workstationRepository.find({
          relations: ['categories'],
        });
    
        return workstation;
      } catch (error) {
        throw new Error(`${WorkstationService.name}[workstations]:${error.message}`);
      }
    }

  findOne(id: number) {
    return `This action returns a #${id} workstation`;
  }

  update(id: number, updateWorkstationDto: PaginationWorkstationDto) {
    return `This action updates a #${id} workstation`;
  }

  remove(id: number) {
    return `This action removes a #${id} workstation`;
  }
}
