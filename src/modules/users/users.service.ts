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
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.groups', 'userToGroup') // Cargar la relación de groups con la tabla UserToGroup
      .leftJoinAndSelect('userToGroup.group', 'group') // Cargar los datos completos de la entidad Group
      .getMany();

    // Eliminar la contraseña de los usuarios, si es que existe
    users.forEach((user) => {
      delete user.password;
    });

    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where({ id: id })
      .leftJoinAndSelect('user.groups', 'userToGroup') // Cargar la relación 'groups' con la tabla UserToGroup
      .leftJoinAndSelect('userToGroup.group', 'group') // Cargar los datos completos de la entidad Group
      .getOne();

    if (!user) {
      throw new NotFoundException('usuario no encontrado');
    }

    delete user.password; //elimina la password del usuario
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    // copia los datos de updateUserDto a user
    Object.assign(user, updateUserDto);

    // se extrae el campo password del objeto user
    const { password, ...passwordRemove } = user;

    await this.userRepository.save(user);

    return passwordRemove;
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
