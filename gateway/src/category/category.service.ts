import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CategoryDto } from './dto/category.dto';
import { PaginationCategoryDto } from './dto/pagination-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { IsNull, Like, Repository } from 'typeorm';
import { PaginationResponseDTO } from '@/base/dto/base.dto';

@Injectable()
export class CategoryService {


  @InjectRepository(Category)
  private readonly categoryRepository: Repository<Category>;
  
    ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async getBy(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: {
        id: id,
      },
      relations: ['users'],
    });
    if (!category) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return category;
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
 
  async all(params: {
    query: PaginationCategoryDto;
  }): Promise<PaginationResponseDTO> {
    const emptyResponse = {
      total: 0,
      pageSize: 0,
      offset: params.query.offset,
      results: [],
    };
    try {
      if (Object.keys(params.query).length === 0) {
        return emptyResponse;
      }
      if (params.query.pageSize?.toString() === '0') {
        return emptyResponse;
      }

      const order = {};
      if (params.query.orderBy && params.query.orderType) {
        order[params.query.orderBy] = params.query.orderType;
      }

      const forPage = params.query.pageSize
        ? parseInt(params.query.pageSize.toString(), 10) || 10
        : 10;
      const skip = params.query.offset;
      const [categories, total] = await this.categoryRepository.findAndCount({
        where: {
          name: params.query.name
            ? Like(`%${params.query.name}%`)
            : undefined,
        },
        relations: ['users'],
        order,
        take: forPage,
        skip: skip,
      });

      return {
        total: total,
        pageSize: forPage,
        offset: params.query.offset,
        results: categories,
      };
    } catch (error) {
      throw new Error(`${CategoryService.name}[all]:${error.message}`);
    }
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async create(params: { body: CategoryDto }): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: params.body.name },
      withDeleted: true,
    });
    if (existingCategory) {
      if (existingCategory.deletedAt) {
        throw new HttpException(
          'Inactive category already exists',
          HttpStatus.CONFLICT,
        );
      } else {
        throw new HttpException('Category already exists', HttpStatus.CONFLICT);
      }
    }
    await this.categoryRepository.save(
      this.categoryRepository.create({
        ...params.body,
        createdAt: new Date(),
      }),
    );
    return await this.categoryRepository.findOne({
      where: { name: params.body.name },
      relations: ['users'],
    });
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async update(params: { id: number; body: CategoryDto }): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id: params.id, deletedAt: IsNull() },
    });
    if (!category) throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    this.categoryRepository.merge(category, params.body);
    await this.categoryRepository.save(category);
    return await this.categoryRepository.findOne({
      where: { id: params.id, deletedAt: IsNull() },
      relations: ['users'],
    });
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async delete(params: { id: number }): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id: params.id },
      relations: ['users', 'services'],
    });
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    if (category.users && category.users.length > 0) {
      throw new HttpException(
        'Category has associated users and cannot be deleted',
        HttpStatus.CONFLICT,
      );
    }
    if (category.services && category.services.length > 0) {
      throw new HttpException(
        'Category has associated services and cannot be deleted',
        HttpStatus.CONFLICT,
      );
    }
    const result = await this.categoryRepository.softDelete(params.id);
    if (result.affected === 0) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    return await this.categoryRepository.findOne({
      where: { id: params.id },
      withDeleted: true,
    });
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
}
