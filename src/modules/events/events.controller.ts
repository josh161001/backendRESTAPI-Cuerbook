import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

import { EventsService } from './events.service';

import { User as UserEntity } from '../users/entities/user.entity';
import { Auth } from 'src/common/decorator/auth.decorator';
import { User } from 'src/common/decorator/user.decorator';
import { AppResource } from 'src/app.roles';
import { InjectRolesBuilder, RolesBuilder } from 'nest-access-control';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    @InjectRolesBuilder()
    private readonly rolesBuilder: RolesBuilder,
  ) {}

  @Auth({
    resource: AppResource.events,
    action: 'create',
    possession: 'own',
  })
  @Post(':groupId')
  async create(
    @Param('groupId') groupId: string,
    @Body() createEventDto: CreateEventDto,
    @Body('categoryId') categoryId: number,
    @User() user: UserEntity,
  ) {
    const data = await this.eventsService.create(
      groupId,
      createEventDto,
      user,
      categoryId,
    );
    return {
      message: 'Evento creado con éxito',
      data: data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.eventsService.findAll();

    return {
      message: 'Lista de eventos',
      data: data,
    };
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.eventsService.findOne(id);

    return {
      message: 'Evento encontrado',
      data,
    };
  }

  @Auth({
    resource: AppResource.events,
    action: 'update',
    possession: 'own',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @User() user?: UserEntity,
  ) {
    let data;

    if (
      this.rolesBuilder.can(user.roles).updateAny(AppResource.events).granted
    ) {
      data = this.eventsService.update(id, updateEventDto);
    } else {
      data = this.eventsService.update(id, updateEventDto, user);
    }

    return {
      message: 'Evento actualizado con éxito',
      data: data,
    };
  }

  // eliminar evento por id y el usuario que lo creo
  @Auth({
    resource: AppResource.events,
    action: 'delete',
    possession: 'own',
  })
  @Delete(':id')
  remove(@Param('id') id: string, user?: UserEntity) {
    let data;

    if (
      this.rolesBuilder.can(user.roles).deleteAny(AppResource.events).granted
    ) {
      data = this.eventsService.remove(id);
    } else {
      data = this.eventsService.remove(id, user);
    }

    return {
      message: 'Evento eliminado con éxito',
      data,
    };
  }
}
