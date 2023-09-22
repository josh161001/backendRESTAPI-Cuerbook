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
  Query,
} from '@nestjs/common';
// entities
import { User as UserEntity } from '../users/entities/user.entity';

import { CreateGroupDto } from './dto/create-group.dto';

import { ApiTags } from '@nestjs/swagger';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';
import { Auth } from 'src/common/decorator/auth.decorator';
import { AppResource } from 'src/app.roles';
import { InjectRolesBuilder, RolesBuilder } from 'nest-access-control';
import { User } from 'src/common/decorator/user.decorator';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    @InjectRolesBuilder()
    private readonly rolesBuilder: RolesBuilder,
  ) {}

  @Auth({
    resource: AppResource.groups,
    action: 'create',
    possession: 'own',
  })
  @Post()
  // crea un grupo y lo asocia al usuario que lo crea autoenticado
  async createGroup(
    @Body() createGroupDto: CreateGroupDto,
    @User() user: UserEntity,
  ) {
    const data = await this.groupsService.createOne(createGroupDto, user);

    return {
      message: 'Grupo creado con éxito',
      data: data,
    };
  }

  // devuelve todos los grupos
  @Get()
  async findAll() {
    const data = await this.groupsService.findAll();

    return {
      message: 'Grupos obtenidos con éxito',
      data: data,
    };
  }

  // devuelve el grupo con id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.groupsService.findOne(id);

    return {
      message: 'Grupo obtenido con éxito',
      data: data,
    };
  }

  // actualiza el grupo con id con el usuario autenticado
  @Auth({
    resource: AppResource.groups,
    action: 'update',
    possession: 'own',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @User() user: UserEntity,
  ) {
    let data;

    if (
      this.rolesBuilder.can(user.roles).updateAny(AppResource.groups).granted
    ) {
      data = await this.groupsService.update(id, updateGroupDto);
    } else {
      data = await this.groupsService.update(id, updateGroupDto, user);
    }

    return {
      message: 'Grupo actualizado con éxito',
      data: data,
    };
  }

  // elimina el grupo con id con el usuario autenticado
  @Auth({
    resource: AppResource.groups,
    action: 'delete',
    possession: 'own',
  })
  @Delete(':id')
  async remove(@Param('id') id: string, @User() user?: UserEntity) {
    let data;

    if (
      this.rolesBuilder.can(user.roles).deleteAny(AppResource.groups).granted
    ) {
      data = await this.groupsService.remove(id);
    } else {
      console.log('user', user);
      data = await this.groupsService.remove(id, user);
    }
    return {
      message: 'Grupo eliminado con éxito',
      data,
    };
  }
}
