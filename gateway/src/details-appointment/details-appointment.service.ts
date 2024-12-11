import { Injectable } from '@nestjs/common';
import { CreateDetailsAppointmentDto } from './dto/details-appointment.dto';
import { UpdateDetailsAppointmentDto } from './dto/pagination-details-appointment.dto';

@Injectable()
export class DetailsAppointmentService {
  create(createDetailsAppointmentDto: CreateDetailsAppointmentDto) {
    return 'This action adds a new detailsAppointment';
  }

  findAll() {
    return `This action returns all detailsAppointment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} detailsAppointment`;
  }

  update(id: number, updateDetailsAppointmentDto: UpdateDetailsAppointmentDto) {
    return `This action updates a #${id} detailsAppointment`;
  }

  remove(id: number) {
    return `This action removes a #${id} detailsAppointment`;
  }
}
