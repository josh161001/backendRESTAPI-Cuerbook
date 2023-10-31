import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorator/auth.decorator';
import { AppResource } from 'src/app.roles';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Auth({
    resource: AppResource.categories,
    action: 'create',
    possession: 'any',
  })
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Get()
  async findAll() {
    const data = await this.categoriesService.findAll();
    return {
      message: 'Categorias encontradas',
      data,
    };
  }

  @Get('total')
  async getCategoriastotalCategorias() {
    const totalCategorias =
      await this.categoriesService.getCategoriasTotalCategorias();
    return {
      message: 'Total de categorias',
      totalCategorias,
    };
  }

  @Auth({
    resource: AppResource.categories,
    action: 'read',
    possession: 'any',
  })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.categoriesService.findOne(id);
  }

  @Auth({
    resource: AppResource.categories,
    action: 'update',
    possession: 'any',
  })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Auth({
    resource: AppResource.categories,
    action: 'delete',
    possession: 'any',
  })
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.categoriesService.remove(id);
  }
}
