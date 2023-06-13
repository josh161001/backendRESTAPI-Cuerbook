import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    // valida que ningun campo este vacio
    const { name, email, password } = createUserDto;
    if (!name || !email || !password) {
      throw new BadRequestException('Todos los campos son obligatorios');
    }
    // crea un formato de correo solo valido institucional de tecnm
    const emailRegex = /^l\d{8}@nuevoleon\.tecnm\.mx$/;
    if (!emailRegex.test(createUserDto.email)) {
      throw new BadRequestException('Formato incorrecto de email');
    }
    // valida que el campo no este vacio y no cuenten los espacios
    const trimName = name.trim();
    const trimEmail = email.trim();
    const trimPassword = password.trim();

    if (
      trimName.length === 0 ||
      trimEmail.length === 0 ||
      trimPassword.length === 0
    ) {
      throw new BadRequestException('los campos no pueden estar vacios');
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
  async findOne(@Param('id') id: number) {
    const data = await this.usersService.findOne(+id);
    return { data };
  }

  // Resto del código del controlador...

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    // Valida que ningun campo esté vacío
    const { name, email, password } = updateUserDto;
    if (!name || !email || !password) {
      throw new BadRequestException('Todos los campos son obligatorios');
    }

    // Crea un formato de correo solo válido institucional de tecnm
    const emailRegex = /^l\d{8}@nuevoleon\.tecnm\.mx$/;
    if (!emailRegex.test(updateUserDto.email)) {
      throw new BadRequestException('Formato incorrecto de email');
    }

    // Valida que el campo no esté vacío y no contenga espacios
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

    const data = await this.usersService.update(+id, updateUserDto);

    return {
      message: 'Usuario editado',
      data,
    };
  }

  // Resto del código del controlador...

  @Delete(':id')
  remove(@Param('id') id: number) {
    const data = this.usersService.remove(+id);

    return {
      message: 'Usuario eliminado',
      data,
    };
  }
}
