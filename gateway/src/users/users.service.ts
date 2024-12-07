import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { UserDto } from '@/users/dto/user.dto';
import { User } from '@/users/entities/user.entity';
import { In, IsNull, Like, Repository } from 'typeorm';
import { PaginationResponseDTO } from '@/base/dto/base.dto';
import { UserPaginationDto } from './dto/pagination-user.dto';
import { Category } from '@/category/entities/category.entity';

@Injectable()
export class UsersService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(Category)
  private readonly categoryRepository: Repository<Category>;

  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  async getBy(body: UserDto): Promise<User> {
    console.log('body', body);
    const user = await this.userRepository.findOne({
      where: {
        id: body.id,
        email: body.email,
      },
      relations: ['role', 'role.permissions', 'categories'],
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

      const order = {};
      if (params.query.orderBy && params.query.orderType) {
        order[params.query.orderBy] = params.query.orderType;
      }

      const forPage = params.query.pageSize
        ? parseInt(params.query.pageSize.toString(), 10) || 10
        : 10;
      const skip = params.query.offset;
      const [users, total] = await this.userRepository.findAndCount({
        where: {
          firstName: params.query.firstName
            ? Like(`%${params.query.firstName}%`)
            : undefined,
          lastName: params.query.lastName
            ? Like(`%${params.query.lastName}%`)
            : undefined,
          email: params.query.email
            ? Like(`%${params.query.email}%`)
            : undefined,
        },
        relations: ['role', 'role.permissions'],
        order,
        take: forPage,
        skip: skip,
      });

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
    if (params.body.categories && params.body.categories.length > 0) {
      const categories = await this.categoryRepository.find({
        where: { id: In(params.body.categories) },
      });
      params.body.categories = categories;
    }
    await this.userRepository.save(
      this.userRepository.create({
        ...params.body,
        password: await this._hashPassword(params.body.password),
        createdAt: new Date(),
      }),
    );
    return await this.userRepository.findOne({
      where: { email: params.body.email },
      relations: ['role', 'role.permissions', 'categories'],
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
