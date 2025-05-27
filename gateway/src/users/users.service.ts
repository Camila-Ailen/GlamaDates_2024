import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { UserDto } from '@/users/dto/user.dto';
import { User } from '@/users/entities/user.entity';
import { In, IsNull, Like, Repository } from 'typeorm';
import { PaginationResponseDTO, ResposeDTO } from '@/base/dto/base.dto';
import { UserPaginationDto } from './dto/pagination-user.dto';
import { Category } from '@/category/entities/category.entity';
import { RolesService } from '@/roles/roles.service';
import { Role } from '@/roles/entities/role.entity';
import { isNotEmpty } from 'class-validator';

@Injectable()
export class UsersService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(Category)
  private readonly categoryRepository: Repository<Category>;

  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async getBy(body: UserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: body.id,
        email: body.email,
      },
      relations: ['role', 'role.permissions', 'categories', 'appointmentClient'],
    });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async getByEmailWithPassword(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role'],
      relations: ['role', 'role.permissions'],
    });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async all(params: {
    query: UserPaginationDto;
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

      const query = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('role.permissions', 'permissions')
        .where(params.query.firstName ? 'user.firstName LIKE :firstName' : '1=1', { firstName: `%${params.query.firstName || ''}%` })
        .andWhere(params.query.lastName ? 'user.lastName LIKE :lastName' : '1=1', { lastName: `%${params.query.lastName || ''}%` })
        .andWhere(params.query.email ? 'user.email LIKE :email' : '1=1', { email: `%${params.query.email || ''}%` })
        .withDeleted();

      if (params.query.orderBy && params.query.orderType) {
        if (!params.query.orderBy.includes('.')) {
          query.orderBy(`user.${params.query.orderBy}`, params.query.orderType.toUpperCase() as 'ASC' | 'DESC');
        } else {
          query.orderBy(params.query.orderBy, params.query.orderType.toUpperCase() as 'ASC' | 'DESC');
        }
      }

      const forPage = params.query.pageSize
        ? parseInt(params.query.pageSize.toString(), 10) || 10
        : 10;
      const skip = params.query.offset;

      const [users, total] = await query
        .take(forPage)
        .skip(skip)
        .getManyAndCount();


      return {
        total: total,
        pageSize: forPage,
        offset: params.query.offset,
        results: users,
      };
    } catch (error) {
      throw new Error(`${UsersService.name}[all]:${error.message}`);
    }
  }

  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async employees(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        relations: ['categories'],
      });

      const filteredUsers = users.filter(user => user.categories && user.categories.length > 0);

      return filteredUsers;
    } catch (error) {
      throw new Error(`${UsersService.name}[employees]:${error.message}`);
    }
  }

  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async create(params: { body: UserDto }): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: params.body.email },
      withDeleted: true,
    });
    if (existingUser) {
      if (existingUser.deletedAt) {
        throw new HttpException(
          'Inactive user already exists',
          HttpStatus.CONFLICT,
        );
      } else {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }
    }

    console.log('params.body', params.body);

    params.body.firstName = params.body.firstName.toUpperCase();
    params.body.lastName = params.body.lastName.toUpperCase();

    // Asignación de rol por defecto si no se proporciona
    if (!params.body.role) {
      const defaultRole = await this.roleRepository.findOne({ where: { id: 2 } });
      if (!defaultRole) {
        throw new HttpException('Default role not found', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      params.body.role = defaultRole;
    }

    // Password por defecto si no se proporciona
    if (!params.body.password || !isNotEmpty(params.body.password)) {
      params.body.password = '12345678';
    }

    console.log('params.body', params.body);

    if (params.body.categories && params.body.categories.length > 0) {
      const categories = await this.categoryRepository.find({
        where: { id: In(params.body.categories) },
      });
      params.body.categories = categories;
    }

    const user = this.userRepository.create({
      ...params.body,
      password: await this._hashPassword(params.body.password),
      createdAt: new Date(),
    });

    await this.userRepository.save(user);

    return await this.userRepository.findOne({
      where: { email: params.body.email },
      relations: ['role', 'role.permissions', 'categories', 'appointmentClient'],
    });
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async update(params: { id: number; body: UserDto }): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: params.id, deletedAt: IsNull() },
    });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    params.body.password = params.body.password
      ? await this._hashPassword(params.body.password)
      : params.body.password;
    if (params.body.categories && params.body.categories.length > 0) {
      const categories = await this.categoryRepository.find({
        where: { id: In(params.body.categories) },
      });
      params.body.categories = categories;
    }
    this.userRepository.merge(user, params.body);
    await this.userRepository.save(user);
    return await this.userRepository.findOne({
      where: { id: params.id, deletedAt: IsNull() },
      relations: ['role', 'role.permissions', 'categories'],
    });
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async delete(params: { id: number }): Promise<User> {
    const result = await this.userRepository.softDelete(params.id);
    if (result.affected === 0) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return await this.userRepository.findOne({
      where: { id: params.id },
      withDeleted: true,
    });
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  private async _hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(8);
    return await bcrypt.hash(password, salt);
  }
}
