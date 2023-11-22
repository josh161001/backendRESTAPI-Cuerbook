import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Event } from './entities/event.entity';
import { Group } from '../groups/entities/group.entity';
import { Category } from '../categories/entities/category.entity';
import { AppRoles } from 'src/app.roles';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRespository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // crea un evento y lo asocia al grupo, al usuario y a la categoria
  async create(
    groupId: string,
    createEventDto: CreateEventDto,
    user: User,
    CategoryId: number,
  ): Promise<Event> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new BadRequestException('El grupo no existe');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: CategoryId },
    });

    if (!category) {
      throw new BadRequestException('La categoria no existe');
    }

    const nombreEvento = await this.eventRepository.findOne({
      where: {
        name: createEventDto.name,
      },
    });

    if (nombreEvento) {
      throw new BadRequestException('El nombre del evento ya existe');
    }

    const evento = await this.eventRepository.create({
      ...createEventDto,
      user,
      group,
      Categories: category,
    });

    delete evento.group.user.password;
    delete evento.user.password;

    return await this.eventRepository.save(evento);
  }

  // busca todos los eventos y elimina el usuario y el grupo
  async findAll(): Promise<Event[]> {
    const eventos = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.Categories', 'Categories')
      .leftJoin('event.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.imagen', 'user.department'])
      .getMany();

    return eventos;
  }

  async finUserEvents(userId: string): Promise<Event[]> {
    const eventos = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.Categories', 'Categories')
      .leftJoin('event.user', 'user')
      .where('user.id = :id', { id: userId })
      .addSelect(['user.id', 'user.name', 'user.imagen', 'user.department'])
      .getMany();

    return eventos;
  }

  async eventosProximos(): Promise<Event[]> {
    const fecha = new Date();

    const eventos = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.Categories', 'Categories')
      .leftJoin('event.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.imagen', 'user.department'])
      .where('event.fecha >= :fecha', { fecha: fecha })
      .orderBy('event.fecha', 'ASC')
      .getMany();

    return eventos;
  }

  async eventosPasados(): Promise<Event[]> {
    const fecha = new Date();

    const eventos = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.Categories', 'Categories')
      .leftJoin('event.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.imagen', 'user.department'])
      .where('event.fecha < :fecha', { fecha: fecha })
      .orderBy('event.fecha', 'DESC')
      .getMany();

    return eventos;
  }

  // devuelve el total de eventos
  async getTotalEventos(): Promise<number> {
    const totalEventos = await this.eventRepository.count();
    return totalEventos;
  }

  // busca el evento por id y el  usuario autenticado
  async getOneByIdEvent(id: string, userEntity?: User): Promise<Event> {
    const evento = await this.eventRepository
      .findOne({ where: { id: id } })
      .then((e) =>
        !userEntity
          ? e
          : !!e &&
            (userEntity.id === e.user.id ||
              userEntity.roles.includes(AppRoles.admin))
          ? e
          : null,
      );

    if (!evento) {
      throw new BadRequestException('El evento no existe o no autorizado');
    }

    delete evento.user;

    return evento;
  }

  // busca el evento por id y el usuario que lo creo
  async findOne(id: string): Promise<Event> {
    const evento = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.Categories', 'Categories')
      .leftJoinAndSelect('event.user', 'user')
      .where('event.id = :id', { id: id })
      .getOne();

    if (!evento) {
      throw new BadRequestException('El evento no existe');
    }

    delete evento.user.password;

    return evento;
  }

  // actualiza el evento por id y el usuario que lo creo
  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    categoryId: number,
    userEntity?: User,
  ) {
    const evento = await this.getOneByIdEvent(id, userEntity);

    if (!evento) {
      throw new BadRequestException('El evento no existe o no autorizado');
    }

    if (categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        throw new BadRequestException('La categoria no existe');
      }

      evento.Categories = category;
    }

    Object.assign(evento, updateEventDto);

    await this.eventRepository.save(evento);

    return evento;
  }

  // elimina el evento por id y el usuario que lo creo
  async remove(id: string, userEntity?: User) {
    const evento = await this.getOneByIdEvent(id, userEntity);

    if (!evento) {
      throw new NotFoundException('El evento no existe o no autorizado');
    }

    const data = await this.eventRepository.remove(evento);

    return {
      message: 'Evento eliminado',
      data,
    };
  }
}
