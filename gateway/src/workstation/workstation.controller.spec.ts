import { Test, TestingModule } from '@nestjs/testing';
import { WorkstationController } from './workstation.controller';
import { WorkstationService } from './workstation.service';

describe('WorkstationController', () => {
  let controller: WorkstationController;

  const mockWorkstationService = {
    create: jest.fn().mockResolvedValue({ id: 1, name: 'Camilla 1' }),
    findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'Camilla 1' }]),
    findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Camilla 1' }),
    update: jest.fn().mockResolvedValue({ id: 1, name: 'Camilla actualizada' }),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkstationController],
      providers: [
        {
          provide: WorkstationService,
          useValue: mockWorkstationService,
        },
      ],
    }).compile();

    controller = module.get<WorkstationController>(WorkstationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a workstation', async () => {
    const dto = { name: 'Camilla 1' };
    const result = await controller.create(dto as any);
    expect(result).toEqual({ id: 1, name: 'Camilla 1' });
    expect(mockWorkstationService.create).toHaveBeenCalledWith(dto);
  });

  it('should return all workstations', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([{ id: 1, name: 'Camilla 1' }]);
    expect(mockWorkstationService.findAll).toHaveBeenCalled();
  });

  it('should return one workstation by ID', async () => {
    const result = await controller.findOne('1');
    expect(result).toEqual({ id: 1, name: 'Camilla 1' });
    expect(mockWorkstationService.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a workstation', async () => {
    const dto = { name: 'Camilla actualizada' };
    const result = await controller.update('1', dto as any);
    expect(result).toEqual({ id: 1, name: 'Camilla actualizada' });
    expect(mockWorkstationService.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove a workstation', async () => {
    const result = await controller.remove('1');
    expect(result).toEqual({ deleted: true });
    expect(mockWorkstationService.remove).toHaveBeenCalledWith(1);
  });
});
