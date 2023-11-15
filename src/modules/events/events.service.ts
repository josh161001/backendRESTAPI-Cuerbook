import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Event } from './entities/event.entity';
import { Group } from '../groups/entities/group.entity';
import { Category } from '../categories/entities/category.entity';

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

    const evento = this.eventRepository.create({
      ...createEventDto,
      user,
      group,
      Categories: category,
    });

    delete evento.group.user.password;
    delete evento.user.password;

    const nuevoEvento = await this.eventRepository.save(evento);

    return nuevoEvento;
  }

  // busca todos los eventos y elimina el usuario y el grupo
  async findAll(): Promise<Event[]> {
    const eventos = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.Categories', 'Categories')
      .leftJoin('event.user', 'user')
      .addSelect(['user.id', 'user.name'])
      .getMany();

    return eventos;
  }

  async eventosProximos(): Promise<Event[]> {
    const fecha = new Date();

    const eventos = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.Categories', 'Categories')
      .leftJoin('event.user', 'user')
      .addSelect(['user.id', 'user.name'])
      .where('event.fecha >= :fecha', { fecha: fecha })
      .orderBy('event.fecha', 'ASC')
      .getMany();

    eventos.map((evento) => {
      delete evento.user.password;
    });

    return eventos;
  }

  async eventosPasados(): Promise<Event[]> {
    const fecha = new Date();

    const eventos = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.Categories', 'Categories')
      .leftJoin('event.user', 'user')
      .addSelect(['user.id', 'user.name'])
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
      .findOne({ where: { id: id }, relations: ['Categories'] })
      .then((e) =>
        !userEntity ? e : !!e && userEntity.id === e.user.id ? e : null,
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
  async update(id: string, updateEventDto: UpdateEventDto, userEntity?: User) {
    const fs = require('fs');

    const evento = await this.getOneByIdEvent(id, userEntity);

    if (!evento) {
      throw new BadRequestException('El evento no existe o no autorizado');
    }
    if (updateEventDto.imagen) {
      const imagenUrl = evento.imagen;

      if (imagenUrl) {
        fs.unlink(`./upload/${imagenUrl}`, (error) => {
          if (error) throw error;
        });
      }

      evento.imagen = updateEventDto.imagen;
    }

    Object.assign(evento, updateEventDto);

    await this.eventRepository.save(evento);

    return evento;
  }

  // elimina el evento por id y el usuario que lo creo
  async remove(id: string, userEntity?: User) {
    const evento = await this.getOneByIdEvent(id, userEntity);

    if (!evento) {
      throw new BadRequestException('El evento no existe o no autorizado');
    }

    const data = await this.eventRepository.remove(evento);

    return {
      message: 'Evento eliminado',
      data,
    };
  }
}
