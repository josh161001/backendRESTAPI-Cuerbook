import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRolesBuilder()
    private readonly rolesBuilder: RolesBuilder,
  ) {}

  @Auth({ resource: AppResource.users, action: 'create', possession: 'any' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    // Crea un formato de correo electrónico válido institucional de TecNM
    const emailRegex = /^l\d{8}@nuevoleon\.tecnm\.mx$/;
    if (!emailRegex.test(createUserDto.email)) {
      throw new BadRequestException('Formato incorrecto de email');
    }

    // Valida que los campos no estén vacíos y no contengan solo espacios
    const trimName = name.trim();
    const trimEmail = email.trim();
    const trimPassword = password.trim();

    if (
      trimName.length === 0 ||
      trimEmail.length === 0 ||
      trimPassword.length === 0
    ) {
      throw new BadRequestException('Los campos no pueden estar vacíos');
    }

    const data = await this.usersService.create(createUserDto);
    return {
      message: 'Usuario creado',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.usersService.findAll();
    return { data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    return { data };
  }

  @Auth({ resource: AppResource.users, action: 'update', possession: 'own' })
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: UserEntity,
  ) {
    let data;

    if (
      this.rolesBuilder.can(user.roles).updateAny(AppResource.users).granted
    ) {
      data = await this.usersService.update(id, updateUserDto);
    } else {
      const { roles, ...rest } = updateUserDto;
      data = await this.usersService.update(id, rest, user);
    }

    return { message: 'Usuario actualizado', data };
  }
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
    const data = await this.usersService.remove(id);

    return {
      message: 'Usuario eliminado',
      data,
    };
  }
}
