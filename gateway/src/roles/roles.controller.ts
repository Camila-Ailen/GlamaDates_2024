import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesService } from '@/roles/roles.service';
import { RoleDto } from '@/roles/dto/role.dto';
import { IdDTO, ResposeDTO } from '@/base/dto/base.dto';
import { RolePaginationDto } from './dto/pagination-role.dto';
import { Auth } from '@/auth/auth.decorator';
import { Auditable } from '@/auditoria/auditable.decorator';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Get(':id')
  @Auth('read:roles')
  @Auditable({ entity: 'Role' })
  @ApiOperation({ summary: 'Get Role by ID' })
  async getById(@Param() params: IdDTO): Promise<ResposeDTO> {
    const role = await this.rolesService.getBy(params.id);
    return { status: 'success', data: role };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Get()
  @Auth('read:roles')
  @Auditable({ entity: 'Role' })
  @ApiOperation({ summary: 'Get all roles' })
  async all(@Query() query: RolePaginationDto): Promise<ResposeDTO> {
    const roles = await this.rolesService.all({ query });
    return { status: 'success', data: roles };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Post()
  @Auth('create:roles')
  @Auditable({ entity: 'Role' })
  @ApiOperation({ summary: 'Create Role' })
  async create(@Body() body: RoleDto): Promise<ResposeDTO> {
    const role = await this.rolesService.create({ body });
    return { status: 'success', data: role };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Patch(':id')
  @Auth('update:roles')
  @Auditable({ entity: 'Role' })
  @ApiOperation({ summary: 'Update Role' })
  async update(
    @Param() params: IdDTO,
    @Body() body: RoleDto,
  ): Promise<ResposeDTO> {
    const updatedRole = await this.rolesService.update({
      id: params.id,
      body,
    });
    return { status: 'success', data: updatedRole };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Delete(':id')
  @Auth('delete:roles')
  @Auditable({ entity: 'Role' })
  @ApiOperation({ summary: 'Delete Role' })
  async delete(@Param() params: IdDTO): Promise<ResposeDTO> {
    const result = await this.rolesService.delete({ id: params.id });
    return { status: 'success', data: result };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
}
