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
    const grupos = await this.groupRepository.find({
      relations: ['user'],
    });

    grupos.map((group) => {
      delete group.user.password;
    });

    return grupos;
  }

  // devuelve el grupo con id si coincide con el id del usuario logueado
  async getByIdUser(id: string, userEntity?: User): Promise<Group> {
    const grupo = await this.groupRepository
      .findOne({ where: { id: id } })
      .then((g) =>
        !userEntity ? g : !!g && userEntity.id === g.user.id ? g : null,
      );

    if (!grupo)
      throw new NotFoundException('Grupo no encontrado o no autorizado');

    delete grupo.user;

    return grupo;
  }

  // devuelve el grupo con id y elimina el campo password del usuario asociado
  async findOne(id: string): Promise<Group> {
    const grupo = await this.groupRepository.findOne({
      where: { id: id },
      relations: ['user'],
    });

    if (!grupo) throw new NotFoundException('Grupo no encontrado');

    delete grupo.user.password;

    return grupo;
  }
  // actualiza el grupo con id si coincide con el id del usuario logueado
  async update(id: string, updateGroupDto: UpdateGroupDto, userEntity?: User) {
    const fs = require('fs');

    const group = await this.getByIdUser(id, userEntity);

    if (!group) {
      throw new NotFoundException('Grupo no encontrado o sin imagen');
    }

    if (updateGroupDto.imagen) {
      const imagenUrl = group.imagen;

      if (imagenUrl) {
        const imageUrl = imagenUrl.split('/').pop();
        fs.unlink(`./upload/${imageUrl}`, (error) => {
          if (error) throw error;
        });
      }

      group.imagen = updateGroupDto.imagen;
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

  async deleteImage(id: string, userEntity?: User): Promise<void> {
    const fs = require('fs');

    const grupo = await this.getByIdUser(id, userEntity);

    if (!grupo || !grupo.imagen) {
      throw new NotFoundException('Grupo no encontrado o sin imagen');
    }

    const imageUrl = grupo.imagen.split('/').pop();

    fs.unlink(`./upload/${imageUrl}`, (error) => {
      if (error) throw error;
    });

    grupo.imagen = null;

    await this.groupRepository.save(grupo);
  }
}
