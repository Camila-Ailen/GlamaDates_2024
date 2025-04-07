import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { SystemConfigService } from '@/system-config/system-config.service';

describe('AppointmentController', () => {
  let controller: AppointmentController;
  let systemConfigService: SystemConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentController],
      providers: [
        {
          provide: AppointmentService,
          useValue: {}, // Podés dejar esto vacío si no vas a usarlo en este test
        },
        {
          provide: SystemConfigService,
          useValue: {
            getSystemConfig: jest.fn().mockResolvedValue({ openDays: ['MONDAY', 'TUESDAY'] }),
          },
        },
      ],
    }).compile();

    controller = module.get<AppointmentController>(AppointmentController);
    systemConfigService = module.get<SystemConfigService>(SystemConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return open days', async () => {
    const result = await controller.getOpenDays();
    expect(result).toEqual({ openDays: ['MONDAY', 'TUESDAY'] });
  });
});
