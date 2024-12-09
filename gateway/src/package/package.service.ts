import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Like, Repository } from 'typeorm';
import { PaginationResponseDTO } from '@/base/dto/base.dto';
import { Package } from './entities/package.entity';
import { PackageDto } from './dto/package.dto';
import { PaginationPackageDto } from './dto/pagination-package.dto';
import { Service } from '@/service/entities/service.entity';
import e from 'express';

@Injectable()
export class PackageService {


  @InjectRepository(Service)
  private readonly serviceRepository: Repository<Service>;

  @InjectRepository(Package)
  private readonly packageRepository: Repository<Package>;

  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async getBy(body: PackageDto): Promise<PackageDto> {
    const pkg = await this.packageRepository.findOne({
      where: {
        id: body.id,
      },
      relations: ['services'],
    });
    if (!pkg) throw new HttpException('Package not found', HttpStatus.NOT_FOUND);
    const finalPackage = new PackageDto();
    finalPackage.id = pkg.id;
    finalPackage.name = pkg.name;
    finalPackage.description = pkg.description;
    finalPackage.services = pkg.services;
    finalPackage.price = pkg.services.reduce((total, service) => total + service.price, 0);
    finalPackage.duration = pkg.services.reduce((total, service) => total + service.duration, 0);
    return finalPackage;
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////

  async all(params: {
    query: PaginationPackageDto;
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
      const [packages, total] = await this.packageRepository.findAndCount({
        where: {
          name: params.query.name
            ? Like(`%${params.query.name}%`)
            : undefined,
          description: params.query.description
            ? Like(`%${params.query.description}%`)
            : undefined,
        },
        relations: ['services'],
        order,
        take: forPage,
        skip: skip,
      });

      // por cada paquete, sumar el precio de los servicios asociados
      // for (const pkg of packages) {
      //   pkg.price = 0;
      //   for (const service of pkg.services) {
      //     pkg.price += service.price;
      //   }
      // }

      const finalPackages: PackageDto[] = [];

      // y por cada paquete crear un nuevo objeto con los campos del DTO y añadir el precio total y la duracion total
      for (const pkg of packages) {
          const finalPackage = new PackageDto();
          finalPackage.id = pkg.id;
          finalPackage.name = pkg.name;
          finalPackage.description = pkg.description;
          finalPackage.services = pkg.services;
          finalPackage.price = pkg.services.reduce((total, service) => total + service.price, 0);
          finalPackage.duration = pkg.services.reduce((total, service) => total + service.duration, 0);

          finalPackages.push(finalPackage);
      }
      
      return {
        total: total,
        pageSize: forPage,
        offset: params.query.offset,
        results: finalPackages,
      };
    } catch (error) {
      throw new Error(`${PackageService.name}[all]:${error.message}`);
    }
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async create(params: { body: PackageDto }): Promise<PackageDto> {
    const existingPackage = await this.packageRepository.findOne({
      where: { name: params.body.name },
      withDeleted: true,
    });
    if (existingPackage) {
      if (existingPackage.deletedAt) {
        throw new HttpException(
          'Inactive package already exists',
          HttpStatus.CONFLICT,
        );
      } else {
        throw new HttpException('Package already exists', HttpStatus.CONFLICT);
      }
    }

    if (params.body.services && params.body.services.length > 0) {
      const service = await this.serviceRepository.find({
        where: { id: In(params.body.services) },
      });
      params.body.services = service;
    }
    console.log("desde el servicio ", params.body.services);
    await this.packageRepository.save(
      this.packageRepository.create({
        ...params.body,
        createdAt: new Date(),
      }),
    );

    const pkg = await this.packageRepository.findOne({
      where: { name: params.body.name },
      relations: ['services'],
    });

    // cada service en el array de services tiene un precio, sumar todos los precios y aneadirlos al precio total del paquete

    // cada service en el array de services tiene una duracion, sumar todas las duraciones y aneadirlas a la duracion total del paquete

    const finalPackage = new PackageDto();
    finalPackage.id = pkg.id;
    finalPackage.name = pkg.name;
    finalPackage.description = pkg.description;
    finalPackage.services = pkg.services;
    finalPackage.price = params.body.services.reduce((total, service) => total + service.price, 0);
    finalPackage.duration = params.body.services.reduce((total, service) => total + service.duration, 0);
    return finalPackage;
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async update(params: { id: number; body: PackageDto }): Promise<PackageDto> {
    const existe = await this.packageRepository.findOne({
      where: { id: params.id },
    });

    if (!existe) {
      throw new HttpException('Package not found', HttpStatus.NOT_FOUND);
    }

    if (params.body.services && params.body.services.length > 0) {
      const service = await this.serviceRepository.find({
        where: { id: In(params.body.services) },
      });
      params.body.services = service;
    }

    this.packageRepository.merge(existe, params.body);
    existe.updatedAt = new Date();
    await this.packageRepository.save(existe);

    const pkg = await this.packageRepository.findOne({
      where: { id: params.id, deletedAt: IsNull() },
      relations: ['services'],
    });



    // cada service en el array de services tiene un precio, sumar todos los precios y aneadirlos al precio total del paquete
    // pkg.price = params.body.services.reduce((total, service) => total + service.price, 0);

    // new Object from DTO and add the fields
    const finalPackage = new PackageDto();
    finalPackage.id = pkg.id;
    finalPackage.name = params.body.name;
    finalPackage.description = params.body.description;
    finalPackage.services = params.body.services;
    finalPackage.price = params.body.services.reduce((total, service) => total + service.price, 0);
    finalPackage.duration = params.body.services.reduce((total, service) => total + service.duration, 0);




    return finalPackage;
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async delete(params: { id: number }): Promise<Package> {
    const pkg = await this.packageRepository.findOne({
      where: { id: params.id },
      relations: ['services'],
    });
    if (!pkg) {
      throw new HttpException('Package not found', HttpStatus.NOT_FOUND);
    }
    if (pkg.services && pkg.services.length > 0) {
      throw new HttpException(
        'Package has associated services and cannot be deleted',
        HttpStatus.CONFLICT,
      );
    }

    const result = await this.packageRepository.softDelete(params.id);
    if (result.affected === 0) {
      throw new HttpException('Package not found', HttpStatus.NOT_FOUND);
    }
    return await this.packageRepository.findOne({
      where: { id: params.id },
      withDeleted: true,
    });
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
}
