import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateGroupDto } from './dto/update-group.dto';
import { User } from '../users/entities/user.entity';
import { Group } from './entities/group.entity';
import { AppRoles } from 'src/app.roles';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  // crea un grupo y lo asocia al usuario que lo crea autoenticado
  async createOne(groupDto: CreateGroupDto, user: User) {
    const nombreGrupo = await this.groupRepository.findOne({
      where: { name: groupDto.name },
    });

    if (nombreGrupo)
      throw new BadRequestException('El nombre del grupo ya existe');

    const grupo = await this.groupRepository.create({
      ...groupDto,
      user,
    });

    delete grupo.user.password;

    return await this.groupRepository.save(grupo);
  }

  // devuelve todos los grupos
  async findAll(): Promise<Group[]> {
    const grupos = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoin('group.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.imagen', 'user.department'])
      .getMany();

    return grupos;
  }
  async findUserGroups(userId: string): Promise<Group[]> {
    const grupos = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoin('group.user', 'user')
      .where('user.id = :id', { id: userId })
      .addSelect(['user.id', 'user.name', 'user.imagen', 'user.department'])
      .getMany();

    return grupos;
  }

  async getTotalGrupos(): Promise<number> {
    const totalGrupos = await this.groupRepository.count();

    return totalGrupos;
  }

  // devuelve el grupo con id si coincide con el id del usuario logueado o si el usuario es un administrador
  async getByIdUser(id: string, userEntity?: User): Promise<Group> {
    const grupo = await this.groupRepository
      .findOne({ where: { id: id } })
      .then((g) =>
        !userEntity
          ? g
          : !!g &&
            (userEntity.id === g.user.id ||
              userEntity.roles.includes(AppRoles.admin))
          ? g
          : null,
      );

    if (!grupo)
      throw new NotFoundException('Grupo no encontrado o no autorizado');

    delete grupo.user.password;

    return grupo;
  }

  async getPopulares(): Promise<Group[]> {
    const grupos = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoin('group.user', 'user')
      .addSelect(['user.name', 'user.imagen', 'user.department', 'user.id'])
      .take(3)
      .getMany();

    return grupos;
  }

  // devuelve el grupo con id y elimina el campo password del usuario asociado
  async findOne(id: string): Promise<Group> {
    const grupo = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.events', 'events')
      .leftJoinAndSelect('events.Categories', 'categories')
      .leftJoin('events.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.imagen', 'user.department'])
      .where('group.id = :id', { id: id })
      .getOne();

    return grupo;
  }
  // actualiza el grupo con id si coincide con el id del usuario logueado
  async update(id: string, updateGroupDto: UpdateGroupDto, userEntity?: User) {
    const group = await this.getByIdUser(id, userEntity);

    if (!group) {
      throw new NotFoundException('Grupo no encontrado o sin imagen');
    }

    Object.assign(group, updateGroupDto);

    await this.groupRepository.save(group);

    return group;
  }

  // elimina el grupo con id si coincide con el id del usuario logueado
  async remove(id: string, userEntity?: User) {
    const group = await this.getByIdUser(id, userEntity);

    if (!group) {
      throw new NotFoundException('Grupo no encontrado o no autorizado');
    }

    const data = await this.groupRepository.remove(group);

    return {
      message: 'Grupo eliminado con éxito',
      data,
    };
  }
}
