import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RoleDto } from './dto/role.dto';
import { RolePaginationDto } from './dto/pagination-role.dto';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  beforeEach(async () => {
    const mockRolesService = {
      getBy: jest.fn().mockResolvedValue('roleById'),
      all: jest.fn().mockResolvedValue(['role1', 'role2']),
      create: jest.fn().mockResolvedValue('newRole'),
      update: jest.fn().mockResolvedValue('updatedRole'),
      delete: jest.fn().mockResolvedValue({ deleted: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getById', () => {
    it('should return a role by id', async () => {
      const result = await controller.getById({ id: 1 });
      expect(service.getBy).toHaveBeenCalledWith(1);
      expect(result).toEqual({ status: 'success', data: 'roleById' });
    });
  });

  describe('all', () => {
    it('should return all roles', async () => {
      const query: RolePaginationDto = { page: 1, limit: 10 } as any;
      const result = await controller.all(query);
      expect(service.all).toHaveBeenCalledWith({ query });
      expect(result).toEqual({ status: 'success', data: ['role1', 'role2'] });
    });
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const body: RoleDto = { name: 'admin' } as any;
      const result = await controller.create(body);
      expect(service.create).toHaveBeenCalledWith({ body });
      expect(result).toEqual({ status: 'success', data: 'newRole' });
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const body: RoleDto = { name: 'updatedName' } as any;
      const result = await controller.update({ id: 1 }, body);
      expect(service.update).toHaveBeenCalledWith({ id: 1, body });
      expect(result).toEqual({ status: 'success', data: 'updatedRole' });
    });
  });

  describe('delete', () => {
    it('should delete a role', async () => {
      const result = await controller.delete({ id: 1 });
      expect(service.delete).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual({ status: 'success', data: { deleted: true } });
    });
  });
});
