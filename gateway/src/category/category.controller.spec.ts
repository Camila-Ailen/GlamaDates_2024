import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryDto } from './dto/category.dto';
import { IdDTO } from '@/base/dto/base.dto';
import { PaginationCategoryDto } from './dto/pagination-category.dto';

describe('CategoryController', () => {
  let controller: CategoryController;

  const mockCategoryService = {
    all: jest.fn().mockResolvedValue([]),
    getBy: jest.fn().mockResolvedValue({ id: 1, name: 'Mock Category' }),
    create: jest.fn().mockResolvedValue({ id: 1, name: 'Created Category' }),
    update: jest.fn().mockResolvedValue({ id: 1, name: 'Updated Category' }),
    delete: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all categories', async () => {
    const query = new PaginationCategoryDto();
    const result = await controller.all(query);
    expect(result).toEqual({ status: 'success', data: [] });
    expect(mockCategoryService.all).toHaveBeenCalledWith({ query });
  });

  it('should get category by ID', async () => {
    const result = await controller.getById({ category: {} } as any, 1);
    expect(result).toEqual({ status: 'success', data: { id: 1, name: 'Mock Category' } });
    expect(mockCategoryService.getBy).toHaveBeenCalled();
  });

  it('should create a category', async () => {
    const body = new CategoryDto();
    const result = await controller.create(body);
    expect(result).toEqual({ status: 'success', data: { id: 1, name: 'Created Category' } });
    expect(mockCategoryService.create).toHaveBeenCalledWith({ body });
  });

  it('should update a category', async () => {
    const body = new CategoryDto();
    const result = await controller.update({ id: 1 }, body, { category: {} } as any);
    expect(result).toEqual({ status: 'success', data: { id: 1, name: 'Updated Category' } });
    expect(mockCategoryService.update).toHaveBeenCalledWith({ id: 1, body });
  });

  it('should delete a category', async () => {
    const result = await controller.delete({ id: 1 });
    expect(result).toEqual({ status: 'success', data: { success: true } });
    expect(mockCategoryService.delete).toHaveBeenCalledWith({ id: 1 });
  });
});
