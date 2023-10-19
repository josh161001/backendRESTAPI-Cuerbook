import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { InjectRolesBuilder, RolesBuilder } from 'nest-access-control';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Auth } from 'src/common/decorator/auth.decorator';
import { AppResource } from 'src/app.roles';
import { User } from 'src/common/decorator/user.decorator';
import { User as UserEntity } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { imagenFileFilter, renameImage } from './helpers/upload.helper';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRolesBuilder()
    private readonly rolesBuilder: RolesBuilder,
  ) {}

  // crea un usuario y crea unas validaciones para el email, nombre y password
  @Auth({ resource: AppResource.users, action: 'create', possession: 'any' })
  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './upload',
        filename: renameImage,
      }),
      fileFilter: imagenFileFilter,
    }),
  )
  async create(
    @UploadedFile() imagen: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    if (!imagen) throw new BadRequestException('Imagen requerida');
    const baseUrl = 'http://localhost:5000';

    createUserDto.imagen = `${baseUrl}/upload/${imagen.filename}`;

    const data = await this.usersService.createUser(createUserDto);
    return {
      message: 'Usuario creado',
      data,
    };
  }

  // devuelve todos los usuarios
  @Get()
  async findAll() {
    const data = await this.usersService.findAll();
    return {
      message: 'Usuarios encontrados',
      data,
    };
  }

  // devuelve el usuario con id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    return { message: 'Usuario encontrado', data };
  }

  // actualiza el usuario con id con el usuario autenticado
  @Auth({ resource: AppResource.users, action: 'update', possession: 'own' })
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
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: UserEntity,
    @UploadedFile() imagen: Express.Multer.File,
  ) {
    let data;

    if (
      this.rolesBuilder.can(user.roles).updateAny(AppResource.users).granted
    ) {
      if (imagen) {
        const baseUrl = 'http://localhost:5000';
        updateUserDto.imagen = `${baseUrl}/upload/${imagen.filename}`;
      }
      data = await this.usersService.update(id, updateUserDto);
    } else {
      if (imagen) {
        const baseUrl = 'http://localhost:5000';
        updateUserDto.imagen = `${baseUrl}/upload/${imagen.filename}`;
      }
      const { roles, ...rest } = updateUserDto;
      data = await this.usersService.update(id, rest, user);
    }

    return { message: 'Usuario actualizado', data };
  }

  //actualiza el password del usuario con id con el usuario autenticado
  @Auth({ resource: AppResource.users, action: 'update', possession: 'own' })
  @Patch(':id/actualizar-password')
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @User() user: UserEntity,
  ) {
    let data;
    if (
      this.rolesBuilder.can(user.roles).updateAny(AppResource.users).granted
    ) {
      data = await this.usersService.updatePassword(id, updatePasswordDto);
    } else {
      data = await this.usersService.updatePassword(
        id,
        updatePasswordDto,
        user,
      );
    }

    return {
      message: 'Password actualizada',
      data,
    };
  }

  // elimina el usuario con id con el usuario autenticado
  @Auth({ action: 'delete', possession: 'any', resource: AppResource.users })
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const usuario = await this.usersService.findOne(id);

    const imagenUrl = usuario.imagen.split('/').pop();

    const fs = require('fs');

    fs.unlink(`./upload/${imagenUrl}`, (error) => {
      if (error) throw error;
    });

    const data = await this.usersService.remove(id);

    return {
      message: 'Usuario eliminado',
      data,
    };
  }

  // elimina la imagen del usuario con id con el usuario autenticado
  @Auth({ action: 'delete', possession: 'own', resource: AppResource.users })
  @Delete(':id/eliminar-imagen')
  async deleteImage(@Param('id') id: string, @User() user: UserEntity) {
    let data;

    if (
      this.rolesBuilder.can(user.roles).updateAny(AppResource.users).granted
    ) {
      data = await this.usersService.deleteImage(id);
    } else {
      data = await this.usersService.deleteImage(id, user);
    }
    return { message: 'Imagen eliminada correctamente', data };
  }
}
