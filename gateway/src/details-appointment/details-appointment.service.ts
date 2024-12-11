import { Injectable } from '@nestjs/common';


@Injectable()
export class DetailsAppointmentService {
  create(createDetailsAppointmentDto) {
    return 'This action adds a new detailsAppointment';
  }

  findAll() {
    return `This action returns all detailsAppointment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} detailsAppointment`;
  }

  update(id: number, updateDetailsAppointmentDto) {
    return `This action updates a #${id} detailsAppointment`;
  }

  remove(id: number) {
    return `This action removes a #${id} detailsAppointment`;
  }
}
