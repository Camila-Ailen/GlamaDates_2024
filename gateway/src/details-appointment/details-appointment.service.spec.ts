import { Test, TestingModule } from '@nestjs/testing';
import { DetailsAppointmentService } from './details-appointment.service';

describe('DetailsAppointmentService', () => {
  let service: DetailsAppointmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetailsAppointmentService],
    }).compile();

    service = module.get<DetailsAppointmentService>(DetailsAppointmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
