import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Auth } from 'src/auth/decorator/auth';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

    try {
      const data = await this.usersService.create(createUserDto);
      return {
        message: 'Usuario creado',
        data,
      };
    } catch (error) {
      console.error(error);

      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
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
