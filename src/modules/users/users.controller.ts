import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ACGuard, UseRoles } from 'nest-access-control';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Auth } from 'src/common/decorator/auth.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(ACGuard)
  @UseRoles({
    resource: 'users',
    action: 'create',
    possession: 'any',
  })
  @Auth()
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

  @Auth()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }
  @Auth()
  @Patch(':id/actualizar-password')
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.updatePassword(id, updatePasswordDto);

    return {
      message: 'contraseña actualizada',
    };
  }

  @Auth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    const data = this.usersService.remove(id);

    return {
      message: 'Usuario eliminado',
      data,
    };
  }
}
