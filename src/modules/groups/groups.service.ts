import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserToGroup } from '../users/entities/userToGroup.entity';
import { UpdateGroupDto } from './dto/update-group.dto';
import { User } from '../users/entities/user.entity';
import { Group } from './entities/group.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserToGroup)
    private readonly userToGroupRepository: Repository<UserToGroup>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(
    categoryId: number,
    groupDto: CreateGroupDto,
    user: User,
  ): Promise<Group> {
    const nameGroup = await this.groupRepository.findOne({
      where: { name: groupDto.name },
    });

    if (nameGroup) {
      throw new BadRequestException('El grupo ya está registrado');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    const group: Group = this.groupRepository.create({
      ...groupDto,
      Categories: category,
    });

    // Guardamos el grupo en la tabla 'Group'
    const saveGroup: Group = await this.groupRepository.save(group);

    // Creamos una nueva entrada en la tabla 'UserToGroup' para establecer la relación
    const userToGroup: UserToGroup = this.userToGroupRepository.create({
      user,
      group: saveGroup, // Asignamos el grupo recién creado
    });

    // Guardamos la relación usuario-grupo en la tabla 'UserToGroup'
    await this.userToGroupRepository.save(userToGroup);

    return saveGroup;
  }

  async findAll(): Promise<Group[]> {
    const groups = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.Categories', 'category') // Cargar los datos completos de la entidad Category
      .leftJoinAndSelect('group.userToGroups', 'userToGroup') // Cargar la relación 'userToGroups' con la tabla UserToGroup
      .leftJoinAndSelect('userToGroup.user', 'user') // Cargar los datos completos de la entidad User
      .leftJoinAndSelect('group.events', 'event') // Cargar los datos completos de la entidad Event
      .getMany();

    return groups;
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupRepository
      .createQueryBuilder('group')
      .where({ id: id })
      .leftJoinAndSelect('group.userToGroups', 'userToGroup') // Cargar la relación userToGroups con la tabla UserToGroup
      .leftJoinAndSelect('userToGroup.user', 'user') // Cargar los datos completos de la entidad User
      .getOne();

    if (!group) {
      throw new NotFoundException('usuario no encontrado');
    }

    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    const group = await this.groupRepository.findOne({ where: { id: id } });

    if (!group) {
      throw new NotFoundException('grupo no encontrado');
    }

    Object.assign(group, updateGroupDto);

    await this.groupRepository.save(group);

    return group;
  }

  remove(id: string) {
    return this.groupRepository.delete(id);
  }
}
