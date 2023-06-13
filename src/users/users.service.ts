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
import { hash } from 'bcrypt';

export interface UserFindOne {
  id?: number;
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
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    // busca en la base de datos el id
    const user = await this.userRepository.findOne({ where: { id: id } });
    // si no hay un id , el siguiente error
    if (!user) {
      throw new NotFoundException('usuario no encontrado');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // busca por id el usuario que modificara
    const userModified = await this.userRepository.findOne({
      where: { id: id },
    });
    // si no lo encuentra mandara el siguiente error
    if (!userModified) throw new NotFoundException('Usuario no encontrado');

    // si lo encuentra
    updateUserDto.password = await hash(updateUserDto.password, 10);
    return this.userRepository.update(id, updateUserDto);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findOneUser(data: UserFindOne) {
    return await this.userRepository
      .createQueryBuilder('user')
      .where(data)
      .addSelect('user.password')
      .getOne();
  }
}
