import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserToEvent } from '../users/entities/userToEvent.entity';
import { User } from '../users/entities/user.entity';
import { Event } from './entities/event.entity';
import { Group } from '../groups/entities/group.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(UserToEvent)
    private readonly userToEvent: Repository<UserToEvent>,
    @InjectRepository(User)
    private readonly userRespository: Repository<User>,
  ) {}

  async create(
    id: string,
    createEventDto: CreateEventDto,
    user: User,
  ): Promise<Event> {
    const group = await this.groupRepository.findOne({
      where: { id },
    });

    if (!group) {
      throw new BadRequestException('El grupo no existe');
    }

    const nameEvent = await this.eventRepository.findOne({
      where: { name: createEventDto.name },
    });

    if (nameEvent) {
      throw new BadRequestException('El evento ya está registrado');
    }

    const event: Event = this.eventRepository.create({
      ...createEventDto,
      group,
    });

    const saveEvent: Event = await this.eventRepository.save(event);

    const userToEvent: UserToEvent = this.userToEvent.create({
      user,
      event: saveEvent,
    });

    await this.userToEvent.save(userToEvent);

    return saveEvent;
  }

  async findAll(): Promise<Event[]> {
    const events = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.userToEvents', 'userToEvent')
      .leftJoinAndSelect('userToEvent.user', 'user')
      .getMany();

    return events;
  }

  findOne(id: string): Promise<Event> {
    const event = this.eventRepository
      .createQueryBuilder('event')
      .where({ id: id })
      .leftJoinAndSelect('event.userToEvents', 'userToEvent')
      .leftJoinAndSelect('userToEvent.user', 'user')
      .getOne();

    if (!event) {
      throw new BadRequestException('El evento no existe');
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.eventRepository.findOne({ where: { id: id } });

    if (!event) {
      throw new BadRequestException('El evento no existe');
    }

    Object.assign(event, updateEventDto);

    await this.eventRepository.save(event);

    return event;
  }

  remove(id: string) {
    return this.eventRepository.delete(id);
  }
}
