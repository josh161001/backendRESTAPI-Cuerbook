import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { imagenFileFilter, renameImage } from '../users/helpers/upload.helper';

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
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './upload',
        filename: renameImage,
      }),
      fileFilter: imagenFileFilter,
    }),
  )
  @Post(':groupId')
  async create(
    @UploadedFile() imagen: Express.Multer.File,
    @Param('groupId') groupId: string,
    @Body() createEventDto: CreateEventDto,
    @Body('categoryId') categoryId: number,
    @User() user: UserEntity,
  ) {
    if (!imagen) throw new BadRequestException('Imagen requerida');
    const baseUrl = 'http://localhost:5000';

    createEventDto.imagen = `${baseUrl}/upload/${imagen.filename}`;

    const data = await this.eventsService.create(
      groupId,
      createEventDto,
      user,
      categoryId,
    );

    console.log(data);

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
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './upload',
        filename: renameImage,
      }),
      fileFilter: imagenFileFilter,
    }),
  )
  @Patch(':id')
  update(
    @UploadedFile() imagen: Express.Multer.File,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @User() user?: UserEntity,
  ) {
    let data;

    if (
      this.rolesBuilder.can(user.roles).updateAny(AppResource.events).granted
    ) {
      if (imagen) {
        const baseUrl = 'http://localhost:5000';
        updateEventDto.imagen = `${baseUrl}/upload/${imagen.filename}`;
      }
      data = this.eventsService.update(id, updateEventDto);
    } else {
      if (imagen) {
        const baseUrl = 'http://localhost:5000';
        updateEventDto.imagen = `${baseUrl}/upload/${imagen.filename}`;
      }
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
  async remove(@Param('id') id: string, user?: UserEntity) {
    const fs = require('fs');

    const evento = await this.eventsService.getOneByIdEvent(id, user);

    if (!evento) {
      throw new BadRequestException('El evento no existe o no autorizado');
    }

    const imagenUrl = evento.imagen.split('/').pop();

    fs.unlink(`./upload/${imagenUrl}`, (error) => {
      if (error) throw error;
    });

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

  @Auth({
    resource: AppResource.events,
    action: 'delete',
    possession: 'own',
  })
  @Delete(':id/eliminar-imagen')
  async deleteImagen(@Param('id') id: string, @User() user?: UserEntity) {
    let data;

    if (
      this.rolesBuilder.can(user.roles).deleteAny(AppResource.events).granted
    ) {
      data = await this.eventsService.deleteImage(id);
    } else {
      data = await this.eventsService.deleteImage(id, user);
    }
    return {
      message: 'Imagen eliminada correctamente',
      data,
    };
  }
}
