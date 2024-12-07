import { User } from './entities/user.entity';
import { UsersService } from '@/users/users.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IdDTO, ResposeDTO } from '@/base/dto/base.dto';
import { BaseController } from '@/base/base.controller';
import { UserDto } from '@/users/dto/user.dto';
import { UserPaginationDto } from './dto/pagination-user.dto';
import { Auth } from '@/auth/auth.decorator';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
@ApiTags('Users')
export class UsersController extends BaseController {
  @Inject(UsersService)
  private readonly userService: UsersService;
  private jwtService: JwtService;

  constructor() {
    super(UsersController);
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Get()
//   @Auth('read:users')
  @ApiOperation({ summary: 'Get all users' })
  async all(@Query() query: UserPaginationDto): Promise<ResposeDTO> {
    const users = await this.userService.all({ query });
    return { status: 'success', data: users };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Get(':id')
//  @Auth('read:users')
  @ApiOperation({ summary: 'Get User by ID' })
  async getById(
    @Req() request: { user: User },
    @Param('id') id: number,
  ): Promise<ResposeDTO> {
    console.log('request.user', request.user);
    const userDto = new UserDto();
    userDto.id = id;
    const user = await this.userService.getBy(userDto);
    return { status: 'success', data: user };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Get('whoami')
  //   @Auth('read:users')
  @ApiOperation({ summary: 'Get User by ID' })
  async whoami(
    @Req() request: { user: User },
    // @Param('id') id: number,
  ): Promise<ResposeDTO> {
    console.log('request.user', request.user);
    const userDto = new UserDto();
    userDto.id = request.user.id;
    console.log('userDto', userDto);
    try {
      //   const user = await this.userService.getBy(userDto);
      return { status: 'success', data: 'user' };
    } catch (error) {
      return { status: 'error', data: error };
    }
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Post()
  //@Auth('create:users')
  @ApiOperation({ summary: 'Create User' })
  @Post()
  async create(@Body() body: UserDto): Promise<ResposeDTO> {
    const user = await this.userService.create({ body });
    return { status: 'success', data: user };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Patch(':id')
  //@Auth('update:users')
  @ApiOperation({ summary: 'Update User' })
  async update(
    @Param() params: IdDTO,
    @Body() body: UserDto,
    @Req() request: { user: User },
  ): Promise<ResposeDTO> {
    return {
      status: 'success',
      data: await this.userService.update({ id: params.id, body }),
    };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Delete(':id')
  //@Auth('delete:users')
  @ApiOperation({ summary: 'Delete User' })
  async delete(@Param() params: IdDTO): Promise<ResposeDTO> {
    const result = await this.userService.delete({ id: params.id });
    return { status: 'success', data: result };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
}
