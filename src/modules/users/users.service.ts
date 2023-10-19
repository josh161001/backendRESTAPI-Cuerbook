import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { compare } from 'bcrypt';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CreateUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
} from './dto/index-user.dto';

export interface UserFindOne {
  id?: string;
  email?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // crea un usuario y elimina el campo password
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const emailExiste = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (emailExiste)
      throw new BadRequestException('El email ya esta registrado');

    const { name, email, password } = createUserDto;

    const emailRegex = /^l\d{8}@nuevoleon\.tecnm\.mx$/;
    if (!emailRegex.test(createUserDto.email)) {
      throw new BadRequestException('Formato incorrecto de email');
    }

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

    const nuevoUsuario = this.userRepository.create(createUserDto);
    const usuario = this.userRepository.save(nuevoUsuario);
    delete (await usuario).password;
    return usuario;
  }
  // devuelve todos los usuarios y elimina el campo password
  async findAll(): Promise<User[]> {
    const usuarios = await this.userRepository.find();

    usuarios.map((usuario) => {
      delete usuario.password;
    });

    return usuarios;
  }

  //busca un usuario por id si coincide con el id del usuario logueado
  async getOneId(id: string, userEntity?: User): Promise<User> {
    const usuario = await this.userRepository
      .findOne({ where: { id: id } })
      .then((u) =>
        !userEntity ? u : !!u && userEntity.id === u.id ? u : null,
      );

    if (!usuario)
      throw new NotFoundException('Usuario no encontrado o no autorizado');

    return usuario;
  }

  // devuelve el usuario con id y elimina el campo password
  async findOne(id: string): Promise<User> {
    const usuario = await this.userRepository.findOne({ where: { id: id } });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    delete usuario.password;

    return usuario;
  }

  //actualiza el usuario con id si coincide con el id del usuario logueado
  //elimina el campo password y devuelve el usuario actualizado
  async update(id: string, updateUserDto: UpdateUserDto, userEntity?: User) {
    const fs = require('fs');

    const usuario = await this.getOneId(id, userEntity);

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if (updateUserDto.imagen) {
      const imagenUrl = usuario.imagen;
      if (imagenUrl) {
        const imageUrl = imagenUrl.split('/').pop();
        fs.unlink(`./upload/${imageUrl}`, (error) => {
          if (error)
            console.error('Error al eliminar la imagen anterior:', error);
        });
      }

      usuario.imagen = updateUserDto.imagen;
    }

    Object.assign(usuario, updateUserDto);

    const { password, ...passwordRemove } = usuario;
    await this.userRepository.save(usuario);

    return passwordRemove;
  }

  //elimina el usuario con id si coincide con el id del usuario logueado
  async remove(id: string, userEntity?: User) {
    const usuario = await this.getOneId(id, userEntity);

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    await this.userRepository.delete(id);
  }

  //actualiza la contraseña del usuario  si conincide con la contraseña actual hasheada
  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
    userEntity?: User,
  ) {
    const usuario = await this.getOneId(id, userEntity);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const validarPassword = await compare(
      updatePasswordDto.password,
      usuario.password,
    );
    if (!validarPassword)
      throw new BadRequestException('La contraseñas no coinciden');

    usuario.password = updatePasswordDto.newPassword;
    await this.userRepository.save(usuario);
  }

  //busca un usuario por id o email y elimina el campo password
  async findOneUser(data: UserFindOne) {
    return await this.userRepository
      .createQueryBuilder('user')
      .where(data)
      .addSelect('user.password')
      .getOne();
  }

  async deleteImage(id: string, userEntity?: User): Promise<void> {
    const fs = require('fs');

    const usuario = await this.getOneId(id, userEntity);

    if (!usuario || !usuario.imagen) {
      throw new NotFoundException(
        'Usuario no encontrado o no tiene una imagen asociada.',
      );
    }
    const imageUrl = usuario.imagen.split('/').pop();

    fs.unlink(`./upload/${imageUrl}`, (error) => {
      if (error) throw error;
    });

    usuario.imagen = null;
    await this.userRepository.save(usuario);
  }
}
