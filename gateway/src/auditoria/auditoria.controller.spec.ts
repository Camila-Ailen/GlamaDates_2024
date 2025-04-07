import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';

describe('AuditoriaController', () => {
  let controller: AuditoriaController;

  const mockAuditoriaService = {
    findAll: jest.fn().mockResolvedValue([{ id: 1, action: 'CREATED' }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditoriaController],
      providers: [
        {
          provide: AuditoriaService,
          useValue: mockAuditoriaService,
        },
      ],
    }).compile();

    controller = module.get<AuditoriaController>(AuditoriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all audit logs', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([{ id: 1, action: 'CREATED' }]);
    expect(mockAuditoriaService.findAll).toHaveBeenCalled();
  });
});
