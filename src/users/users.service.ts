import { UpdatePasswordDto } from './dto/update-password.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { compare, hash } from 'bcrypt';

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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const emailExiste = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (emailExiste)
      throw new BadRequestException('El email ya esta registrado');

    const newUser = this.userRepository.create(createUserDto);
    const user = this.userRepository.save(newUser);
    delete (await user).password;
    return user;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();

    users.forEach((user) => {
      delete user.password; //elimina la password de todos los usuarios
    });

    return users;
  }

  async findOne(id: string): Promise<User> {
    // busca en la base de datos el id
    const user = await this.userRepository.findOne({ where: { id: id } });
    // si no hay un id , el siguiente error
    if (!user) {
      throw new NotFoundException('usuario no encontrado');
    }

    delete user.password; //elimina la password del usuario
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // busca por id el usuario que se modificará
    const user = await this.userRepository.findOne({
      where: { id: id },
    });
    // si no lo encuentra mandará el siguiente error
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // copia los datos de updateUserDto a user
    Object.assign(user, updateUserDto);

    // se extrae el campo password del objeto user
    const { password, ...passwordModified } = user;

    await this.userRepository.save(user);

    return passwordModified;
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    // busca el usuario en la base de datos
    const user = await this.userRepository.findOne({ where: { id: id } });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    // compara contraseña actual con la de la base de datos hasheada
    const validPassword = await compare(
      updatePasswordDto.password,
      user.password,
    );

    if (!validPassword) throw new BadRequestException('Contraseña incorrecta');

    // guarda la nueva contraseña en la base de datos
    user.password = updatePasswordDto.newPassword;
    await this.userRepository.save(user);
  }

  async findOneUser(data: UserFindOne) {
    return await this.userRepository
      .createQueryBuilder('user')
      .where(data)
      .addSelect('user.password')
      .getOne();
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
