import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDto } from './dto/category.dto';
import { ApiOperation } from '@nestjs/swagger';
import { IdDTO, ResposeDTO } from '@/base/dto/base.dto';
import { Category } from './entities/category.entity';
import { PaginationCategoryDto } from './dto/pagination-category.dto';
import { PermissionsGuard } from '@/auth/permissions.guard';
import { Auth } from '@/auth/auth.decorator';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

    ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Get()
  @Auth('read:categories')
  @ApiOperation({ summary: 'Get all categories' })
  async all(@Query() query: PaginationCategoryDto): Promise<ResposeDTO> {
    const categories = await this.categoryService.all({ query });
    return { status: 'success', data: categories };
  }

 ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Get(':id')
  @Auth('read:categories')
  @ApiOperation({ summary: 'Get Category by ID' })
  async getById(
    @Req() request: { category: Category },
    @Param('id') id: number,
  ): Promise<ResposeDTO> {
    const category = await this.categoryService.getBy(id);
    return { status: 'success', data: category };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Post()
  @Auth('create:categories')
  @ApiOperation({ summary: 'Create Category' })
  @Post()
  async create(@Body() body: CategoryDto): Promise<ResposeDTO> {
    const category = await this.categoryService.create({ body });
    return { status: 'success', data: category };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Patch(':id')
  @Auth('update:categories')
  @ApiOperation({ summary: 'Update Category' })
  async update(
    @Param() params: IdDTO,
    @Body() body: CategoryDto,
    @Req() request: { category: Category },
  ): Promise<ResposeDTO> {
    return {
      status: 'success',
      data: await this.categoryService.update({ id: params.id, body }),
    };
  }
////////////////////////////////////////////////
  ////////////////////////////////////////////////
  @Delete(':id')
  @Auth('delete:categories')
  @ApiOperation({ summary: 'Delete Category' })
  async delete(@Param() params: IdDTO): Promise<ResposeDTO> {
    const result = await this.categoryService.delete({ id: params.id });
    return { status: 'success', data: result };
  }
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
}