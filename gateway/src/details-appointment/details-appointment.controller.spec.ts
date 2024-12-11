import { Test, TestingModule } from '@nestjs/testing';
import { DetailsAppointmentController } from './details-appointment.controller';
import { DetailsAppointmentService } from './details-appointment.service';

describe('DetailsAppointmentController', () => {
  let controller: DetailsAppointmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetailsAppointmentController],
      providers: [DetailsAppointmentService],
    }).compile();

    controller = module.get<DetailsAppointmentController>(DetailsAppointmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
