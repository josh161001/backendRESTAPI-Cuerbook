import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import * as fs from 'fs';
import * as path from 'path';

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
    const baseUrl = 'https://cuerbook-backend.onrender.com';

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

  @Get('total')
  async getUserCount() {
    const usuariosTotal = await this.usersService.getTotalUsers();

    return {
      message: 'Numero total de usuarios',
      usuariosTotal,
    };
  }
  // devuelve el usuario con id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    return { message: 'Usuario encontrado', data };
  }

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
    const fs = require('fs');

    if (
      this.rolesBuilder.can(user.roles).updateAny(AppResource.users).granted
    ) {
      if (imagen) {
        const usuario = await this.usersService.findOne(id);

        if (usuario && usuario.imagen) {
          const imagenUrl = usuario.imagen.split('/').pop();
          const imagePath = `./upload/${imagenUrl}`;

          if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (error) => {
              if (error) {
                console.error('Error eliminando la imagen:', error);
              } else {
                console.log('Imagen eliminada correctamente.');
              }
            });
          } else {
            console.log('La imagen no existe en la ruta actual.');
            // Actualizamos la imagen del usuario con la nueva dirección proporcionada
            const baseUrl = 'https://cuerbook-backend.onrender.com';
            usuario.imagen = `${baseUrl}/upload/${imagen.filename}`;
            await this.usersService.update(id, { imagen: usuario.imagen });
          }

          const baseUrl = 'https://cuerbook-backend.onrender.com';
          updateUserDto.imagen = `${baseUrl}/upload/${imagen.filename}`;
        } else {
          const baseUrl = 'https://cuerbook-backend.onrender.com';
          updateUserDto.imagen = `${baseUrl}/upload/${imagen.filename}`;
        }
      } else {
        const user = await this.usersService.findOne(id);
        if (user && user.imagen) {
          updateUserDto.imagen = user.imagen;
        }
      }
      data = await this.usersService.update(id, updateUserDto);
    } else {
      // Resto del código si el usuario no tiene permisos para actualizar
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

  @Auth({ action: 'delete', possession: 'any', resource: AppResource.users })
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const usuario = await this.usersService.findOne(id);

    if (usuario && usuario.imagen) {
      const imagenUrl = usuario.imagen.split('/').pop();
      const imagePath = `./upload/${imagenUrl}`;

      const fs = require('fs');

      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (error) => {
          if (error) {
            console.error('Error eliminando la imagen:', error);
          } else {
            console.log('Imagen eliminada correctamente.');
          }
        });
      } else {
        console.log('La imagen no existe en la ruta actual.');

        // Eliminar la URL de la imagen del usuario si la imagen no existe
        usuario.imagen = null;
        // Guardar el usuario actualizado sin la URL de la imagen
        await this.usersService.update(id, { imagen: null });
      }
    } else {
      console.log('El usuario no tiene una imagen asociada.');
    }

    const data = await this.usersService.remove(id);

    return {
      message: 'Usuario eliminado junto con la imagen (si existía)',
      data,
    };
  }
}
