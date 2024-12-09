import { Injectable } from '@nestjs/common';
import { WorkstationDto } from './dto/workstation.dto';
import { PaginationWorkstationDto } from './dto/pagination-workstation.dto';

@Injectable()
export class WorkstationService {
  create(createWorkstationDto: WorkstationDto) {
    return 'This action adds a new workstation';
  }

  findAll() {
    return `This action returns all workstation`;
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
