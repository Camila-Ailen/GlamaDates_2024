import { Test, TestingModule } from '@nestjs/testing';
import { MercadopagoController } from './mercadopago.controller';
import { MercadopagoService } from './mercadopago.service';

describe('MercadopagoController', () => {
  let controller: MercadopagoController;
  let service: MercadopagoService;

  beforeEach(async () => {
    const mockMercadopagoService = {
      create: jest.fn().mockResolvedValue({ preferenceId: 'abc123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MercadopagoController],
      providers: [
        {
          provide: MercadopagoService,
          useValue: mockMercadopagoService,
        },
      ],
    }).compile();

    controller = module.get<MercadopagoController>(MercadopagoController);
    service = module.get<MercadopagoService>(MercadopagoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return its result', async () => {
      const mockAppointment = { userId: 1, total: 500 };
      const result = await controller.create(mockAppointment);

      expect(service.create).toHaveBeenCalledWith(mockAppointment);
      expect(result).toEqual({ preferenceId: 'abc123' });
    });
  });
});
