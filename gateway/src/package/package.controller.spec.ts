import { Test, TestingModule } from '@nestjs/testing';
import { PackageController } from './package.controller';
import { PackageService } from './package.service';
import { PackageDto } from './dto/package.dto';

describe('PackageController', () => {
  let controller: PackageController;
  let service: PackageService;

  beforeEach(async () => {
    const mockPackageService = {
      all: jest.fn().mockResolvedValue(['mockedPackage']),
      getBy: jest.fn().mockResolvedValue('mockedPackage'),
      create: jest.fn().mockResolvedValue('createdPackage'),
      update: jest.fn().mockResolvedValue('updatedPackage'),
      delete: jest.fn().mockResolvedValue({ deleted: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackageController],
      providers: [
        {
          provide: PackageService,
          useValue: mockPackageService,
        },
      ],
    }).compile();

    controller = module.get<PackageController>(PackageController);
    service = module.get<PackageService>(PackageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getById', () => {
    it('should return a package by id', async () => {
      const result = await controller.getById({ package: {} } as any, 1);
      expect(service.getBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual({ status: 'success', data: 'mockedPackage' });
    });
  });

  describe('create', () => {
    it('should create a package', async () => {
      const dto: PackageDto = { id: 1, nombre_paquete: 'Pack A' } as any;
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith({ body: dto });
      expect(result).toEqual({ status: 'success', data: 'createdPackage' });
    });
  });

  describe('update', () => {
    it('should update a package', async () => {
      const dto: PackageDto = { id: 1, nombre_paquete: 'Updated Pack' } as any;
      const result = await controller.update({ id: 1 }, dto, { package: {} } as any);
      expect(service.update).toHaveBeenCalledWith({ id: 1, body: dto });
      expect(result).toEqual({ status: 'success', data: 'updatedPackage' });
    });
  });

  describe('delete', () => {
    it('should delete a package', async () => {
      const result = await controller.delete({ id: 1 });
      expect(service.delete).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual({ status: 'success', data: { deleted: true } });
    });
  });
});
