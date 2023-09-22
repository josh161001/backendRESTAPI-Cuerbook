import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

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
      throw new Error('La categoria ya existe');
    }

    const categoria = this.categoryRepository.create(createCategoryDto);

    return this.categoryRepository.save(categoria);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const categoria = await this.categoryRepository.update(
      id,
      updateCategoryDto,
    );

    return categoria;
  }

  remove(id: number) {
    return this.categoryRepository.delete(id);
  }
}
