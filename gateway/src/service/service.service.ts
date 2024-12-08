import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ServiceDto } from './dto/service.dto';
import { PaginationServiceDto } from './dto/pagination-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { IsNull, Like, Repository } from 'typeorm';
import { PaginationResponseDTO } from '@/base/dto/base.dto';
import { Category } from '@/category/entities/category.entity';

@Injectable()
export class ServiceService {


  @InjectRepository(Service)
  private readonly serviceRepository: Repository<Service>;

  @InjectRepository(Category)
  private readonly categoryRepository: Repository<Category>;
  
    ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async getBy(body: ServiceDto): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: {
        id: body.id,
      },
      relations: ['category'],
    });
    if (!service) throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
    return service;
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
 
  async all(params: {
    query: PaginationServiceDto;
  }): Promise<PaginationResponseDTO> {
    const emptyResponse = {
      total: 0,
      pageSize: 0,
      offset: params.query.offset,
      results: [],
    };
    console.log("desde el servicio 1 ",params.query);
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
      const [services, total] = await this.serviceRepository.findAndCount({
        where: {
          name: params.query.name
            ? Like(`%${params.query.name}%`)
            : undefined,
          description: params.query.description
            ? Like(`%${params.query.description}%`)
            : undefined,
        },
        relations: ['category'],
        order,
        take: forPage,
        skip: skip,
      });

      console.log("desde el servicio ",params.query);


      return {
        total: total,
        pageSize: forPage,
        offset: params.query.offset,
        results: services,
      };
    } catch (error) {
      throw new Error(`${ServiceService.name}[all]:${error.message}`);
    }
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async create(params: { body: ServiceDto }): Promise<Service> {
    const existingService = await this.serviceRepository.findOne({
      where: { name: params.body.name },
      withDeleted: true,
    });
    if (existingService) {
      if (existingService.deletedAt) {
        throw new HttpException(
          'Inactive service already exists',
          HttpStatus.CONFLICT,
        );
      } else {
        throw new HttpException('Service already exists', HttpStatus.CONFLICT);
      }
    }
    const category = await this.categoryRepository.findOne({
      where: { id: params.body.category.id },
    });
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    params.body.category = category;
    console.log("desde el servicio ",params.body);
    await this.serviceRepository.save(
      this.serviceRepository.create({
        ...params.body,
        createdAt: new Date(),
      }),
    );
    return await this.serviceRepository.findOne({
      where: { name: params.body.name },
      relations: ['category'],
    });
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async update(params: { id: number; body: ServiceDto }): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id: params.id, deletedAt: IsNull() },
    });
    if (!service) throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
    this.serviceRepository.merge(service, params.body);
    await this.serviceRepository.save(service);
    return await this.serviceRepository.findOne({
      where: { id: params.id, deletedAt: IsNull() },
      relations: ['category'],
    });
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async delete(params: { id: number }): Promise<Service> {
    const result = await this.serviceRepository.softDelete(params.id);
    if (result.affected === 0) {
      throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
    }
    return await this.serviceRepository.findOne({
      where: { id: params.id },
      withDeleted: true,
    });
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
}
