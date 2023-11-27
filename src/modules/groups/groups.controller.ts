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
  NotFoundException,
} from '@nestjs/common';
// entities

import { Auth } from 'src/common/decorator/auth.decorator';
import { User } from 'src/common/decorator/user.decorator';

import { ApiTags } from '@nestjs/swagger';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';

import { User as UserEntity } from '../users/entities/user.entity';
import { AppResource } from 'src/app.roles';
import { InjectRolesBuilder, RolesBuilder } from 'nest-access-control';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { imagenFileFilter, renameImage } from '../users/helpers/upload.helper';

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
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './upload',
        filename: renameImage,
      }),
      fileFilter: imagenFileFilter,
    }),
  )
  @Post()
  // crea un grupo y lo asocia al usuario que lo crea autoenticado
  async createGroup(
    @UploadedFile() imagen: Express.Multer.File,
    @Body() createGroupDto: CreateGroupDto,
    @User() user: UserEntity,
  ) {
    if (!imagen) throw new BadRequestException('Imagen requerida');
    const baseUrl = 'https://cuerbook-backend.onrender.com';

    createGroupDto.imagen = `${baseUrl}/upload/${imagen.filename}`;

    const data = await this.groupsService.createOne(createGroupDto, user);

    return {
      message: 'Grupo creado con éxito',
      data: data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.groupsService.findAll();

    return {
      message: 'Grupos obtenidos con éxito',
      data: data,
    };
  }

  @Auth({ resource: AppResource.groups, action: 'read', possession: 'own' })
  @Get('grupo-usuario')
  async findUserGroups(@User() user: UserEntity) {
    return this.groupsService.findUserGroups(user.id);
  }

  @Get('populares')
  async getGruposPopulares() {
    const data = await this.groupsService.getPopulares();

    return {
      message: 'Grupos obtenidos con éxito',
      data: data,
    };
  }

  @Get('total')
  async getGruposCount() {
    const totalGrupos = await this.groupsService.getTotalGrupos();

    return {
      message: 'Total de grupos',
      totalGrupos,
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
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @User() user: UserEntity,
    @UploadedFile() imagen: Express.Multer.File,
  ) {
    const fs = require('fs');

    let data;

    if (
      this.rolesBuilder.can(user.roles).updateAny(AppResource.groups).granted
    ) {
      if (imagen) {
        const grupo = await this.groupsService.findOne(id);

        if (grupo && grupo.imagen) {
          const imagenUrl = grupo.imagen.split('/').pop();
          const imagePath = `./upload/${imagenUrl}`;

          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath, (error) => {
              if (error) {
                console.log(error);
              } else {
              }
            });
          } else {
            const baseUrl = 'https://cuerbook-backend.onrender.com';
            grupo.imagen = `${baseUrl}/upload/${imagen.filename}`;
            await this.groupsService.update(id, { imagen: grupo.imagen });
          }
          const baseUrl = 'https://cuerbook-backend.onrender.com';
          updateGroupDto.imagen = `${baseUrl}/upload/${imagen.filename}`;
        } else {
          const baseUrl = 'https://cuerbook-backend.onrender.com';
          updateGroupDto.imagen = `${baseUrl}/upload/${imagen.filename}`;
        }
      } else {
        const grupo = await this.groupsService.findOne(id);
        if (grupo && grupo.imagen) {
          updateGroupDto.imagen = grupo.imagen;
        }
      }
      data = await this.groupsService.update(id, updateGroupDto);
    } else {
      if (imagen) {
        const grupo = await this.groupsService.getByIdUser(id, user);

        if (grupo && grupo.imagen) {
          const imagenUrl = grupo.imagen.split('/').pop();
          const imagePath = `./upload/${imagenUrl}`;

          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath, (error) => {
              if (error) {
                console.log(error);
              } else {
              }
            });
          } else {
            const baseUrl = 'https://cuerbook-backend.onrender.com';
            grupo.imagen = `${baseUrl}/upload/${imagen.filename}`;
            await this.groupsService.update(id, { imagen: grupo.imagen });
          }
          const baseUrl = 'https://cuerbook-backend.onrender.com';
          updateGroupDto.imagen = `${baseUrl}/upload/${imagen.filename}`;
        } else {
          const baseUrl = 'https://cuerbook-backend.onrender.com';
          updateGroupDto.imagen = `${baseUrl}/upload/${imagen.filename}`;
        }
      } else {
        const grupo = await this.groupsService.getByIdUser(id, user);
        if (grupo && grupo.imagen) {
          updateGroupDto.imagen = grupo.imagen;
        }
      }
      data = await this.groupsService.update(id, updateGroupDto, user);
    }

    return {
      message: 'Grupo actualizado con éxito',
      data,
    };
  }

  @Auth({
    resource: AppResource.groups,
    action: 'delete',
    possession: 'own',
  })
  @Delete(':id')
  async remove(@Param('id') id: string, @User() user: UserEntity) {
    const fs = require('fs');
    const grupo = await this.groupsService.getByIdUser(id, user);
    let data;

    if (
      this.rolesBuilder.can(user.roles).deleteAny(AppResource.groups).granted
    ) {
      if (grupo && grupo.imagen) {
        const imagenUrl = grupo.imagen.split('/').pop();
        const imagePath = `./upload/${imagenUrl}`;

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath, (error) => {
            if (error) {
              console.log(error);
            } else {
            }
          });
        } else {
          grupo.imagen = null;
          await this.groupsService.update(id, { imagen: grupo.imagen });
        }
      }
      data = await this.groupsService.remove(id);
    } else {
      if (grupo && grupo.imagen) {
        const imagenUrl = grupo.imagen.split('/').pop();
        const imagePath = `./upload/${imagenUrl}`;

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath, (error) => {
            if (error) {
              throw new BadRequestException('error');
            } else {
            }
          });
        } else {
          grupo.imagen = null;
          await this.groupsService.update(id, { imagen: grupo.imagen });
        }
      }
      data = await this.groupsService.remove(id, user);
    }

    return {
      message: 'Grupo eliminado con éxito',
      data,
    };
  }
}
