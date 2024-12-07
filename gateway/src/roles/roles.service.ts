import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { Role } from '@/roles/entities/role.entity';
import { RoleDto } from './dto/role.dto';
import { PaginationResponseDTO } from '@/base/dto/base.dto';
import { Permission } from '@/permissions/entities/permission.entity';
import { RolePaginationDto } from './dto/pagination-role.dto';

@Injectable()
export class RolesService {
  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private readonly permissionRepository: Repository<Permission>;

  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async getBy(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['permissions'],
    });
    if (!role) throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    return role;
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async all(params: {
    query: RolePaginationDto;
  }): Promise<PaginationResponseDTO> {
    const {
      offset = 0,
      pageSize = 10,
      orderBy = 'id',
      orderType = 'ASC',
    } = params.query;

    const [results, total] = await this.roleRepository.findAndCount({
      where: { deletedAt: IsNull() },
      relations: ['permissions'],
      skip: offset,
      take: pageSize,
      order: {
        [orderBy]: orderType,
      },
    });

    return {
      total,
      pageSize: pageSize,
      offset,
      results,
    };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async create(params: { body: RoleDto }): Promise<Role> {
    if (
      await this.roleRepository.findOneBy({
        role: params.body.role,
      })
    ) {
      throw new HttpException('Role already exists', HttpStatus.CONFLICT);
    }
    if (params.body.permissions && params.body.permissions.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: { id: In(params.body.permissions) },
      });
      params.body.permissions = permissions;
    }
    await this.roleRepository.save(
      this.roleRepository.create({
        ...params.body,
        createdAt: new Date(),
      }),
    );
    return await this.roleRepository.findOne({
      where: { role: params.body.role },
      relations: ['permissions'],
    });
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async update(params: { id: number; body: RoleDto }): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: params.id },
    });
    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }
    if (params.body.permissions && params.body.permissions.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: { id: In(params.body.permissions) },
      });
      role.permissions = permissions;
    }
    this.roleRepository.merge(role, params.body);
    role.updatedAt = new Date();
    await this.roleRepository.save(role);
    return await this.roleRepository.findOne({
      where: { id: params.id },
      relations: ['permissions'],
    });
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async delete(params: { id: number }): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: params.id },
      relations: ['users'],
    });
    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }
    if (role.users && role.users.length > 0) {
      throw new HttpException(
        'Role has associated users and cannot be deleted',
        HttpStatus.CONFLICT,
      );
    }
    const result = await this.roleRepository.softDelete(params.id);
    if (result.affected === 0) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }
    return await this.roleRepository.findOne({
      where: { id: params.id },
      withDeleted: true,
    });
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
}
