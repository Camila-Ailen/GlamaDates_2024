import { Test, TestingModule } from '@nestjs/testing';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { ServiceDto } from './dto/service.dto';
import { PaginationServiceDto } from './dto/pagination-service.dto';

describe('ServiceController', () => {
  let controller: ServiceController;
  let service: ServiceService;

  const mockService = {
    all: jest.fn().mockResolvedValue([{ id: 1, name: 'Mock Service' }]),
    getBy: jest.fn().mockResolvedValue({ id: 1, name: 'Mock Service' }),
    create: jest.fn().mockResolvedValue({ id: 1, name: 'New Service' }),
    update: jest.fn().mockResolvedValue({ id: 1, name: 'Updated Service' }),
    delete: jest.fn().mockResolvedValue({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceController],
      providers: [
        {
          provide: ServiceService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ServiceController>(ServiceController);
    service = module.get<ServiceService>(ServiceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  it('should return a service by id', async () => {
    const result = await controller.getById({ service: {} } as any, 1);
    expect(result).toEqual({ status: 'success', data: { id: 1, name: 'Mock Service' } });
    expect(service.getBy).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('should create a service', async () => {
    const body: ServiceDto = { name: 'New Service' } as any;
    const result = await controller.create(body);
    expect(result).toEqual({ status: 'success', data: { id: 1, name: 'New Service' } });
    expect(service.create).toHaveBeenCalledWith({ body });
  });

  it('should update a service', async () => {
    const body: ServiceDto = { name: 'Updated Service' } as any;
    const result = await controller.update({ id: 1 }, body, { service: {} } as any);
    expect(result).toEqual({ status: 'success', data: { id: 1, name: 'Updated Service' } });
    expect(service.update).toHaveBeenCalledWith({ id: 1, body });
  });

  it('should delete a service', async () => {
    const result = await controller.delete({ id: 1 });
    expect(result).toEqual({ status: 'success', data: { deleted: true } });
    expect(service.delete).toHaveBeenCalledWith({ id: 1 });
  });
});
