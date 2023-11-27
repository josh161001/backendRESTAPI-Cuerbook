import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const nombreCategoria = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (nombreCategoria) {
      throw new BadRequestException('La categoria ya existe');
    }

    const categoria = this.categoryRepository.create(createCategoryDto);

    return this.categoryRepository.save(categoria);
  }

  async findAll(): Promise<Category[]> {
    const categorias = await this.categoryRepository.find();

    return categorias;
  }

  async getCategoriasTotalCategorias(): Promise<number> {
    const totalCategorias = await this.categoryRepository.count();
    return totalCategorias;
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    return category;
  }

  remove(id: number) {
    return this.categoryRepository.delete(id);
  }
}
