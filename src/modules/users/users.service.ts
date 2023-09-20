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
import { compare } from 'bcrypt';

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

  async findOne(id: string, userEntity?: User): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where({ id: id })
      .leftJoinAndSelect('user.groups', 'userToGroup') // Cargar la relación 'groups' con la tabla UserToGroup
      .leftJoinAndSelect('userToGroup.group', 'group') // Cargar los datos completos de la entidad Group
      .getOne()
      .then((u) =>
        !userEntity ? u : !!u && userEntity.id === u.id ? u : null,
      );

    if (!user) {
      throw new NotFoundException('usuario no encontrado o no autorizado');
    }

    delete user.password; //elimina la password del usuario
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, userEntity?: User) {
    const user = await this.userRepository.findOne({
      where: { id: id, ...(userEntity ? { id: userEntity.id } : {}) },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // copia los datos de updateUserDto a user
    Object.assign(user, updateUserDto);

    // se extrae el campo password del objeto user
    const { password, ...passwordRemove } = user;

    await this.userRepository.save(user);

    return passwordRemove;
  }

  //busca un usuario por id si concide con el id del usuario logueado
  //se elimina el usuario, si no concide me manda unobjeto vacio y no se elimina
  async remove(id: string, userEntity?: User) {
    const user = await this.userRepository.findOne({
      where: { id: id, ...(userEntity ? { id: userEntity.id } : {}) },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.userRepository.delete(id);
  }

  //actualiza la contraseña del usuario  si conincide con la contraseña actual hasheada
  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
    userEntity?: User,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: id, ...(userEntity ? { id: userEntity.id } : {}) },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const passValid = await compare(updatePasswordDto.password, user.password);
    if (!passValid)
      throw new BadRequestException(
        'las contrasenas no coinciden o no estas autorizado',
      );

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
}
