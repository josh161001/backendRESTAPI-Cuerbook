import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Notice } from './entities/notice.entity';
import { CreateNoticeDto } from './dto/create-notice.dto';

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
    @InjectRepository(User)
    private readonly userRespository: Repository<User>,
  ) {}

  async create(createNoticeDto: CreateNoticeDto, user: User): Promise<Notice> {
    const nombreNotice = await this.noticeRepository.findOne({
      where: { name: createNoticeDto.name },
    });

    if (nombreNotice)
      throw new NotFoundException('El nombre de la noticia ya existe');

    const notice = await this.noticeRepository.create({
      ...createNoticeDto,
      user,
    });

    delete notice.user.password;
    return await this.noticeRepository.save(notice);
  }

  async findAll(): Promise<Notice[]> {
    const Notices = await this.noticeRepository.find({
      relations: ['user'],
    });

    Notices.map((notice) => {
      delete notice.user.password;
    });

    return Notices;
  }

  async getByUserNotice(id: string, userEntity?: User): Promise<Notice> {
    const notice = await this.noticeRepository
      .findOne({ where: { id: id } })
      .then((n) =>
        !userEntity ? n : !!n && userEntity.id === n.user.id ? n : null,
      );

    if (!notice) {
      throw new NotFoundException('La noticia no existe o no esta autorizado');
    }

    delete notice.user;

    return notice;
  }

  async findOne(id: string): Promise<Notice> {
    const notice = await this.noticeRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notice) {
      throw new NotFoundException('La noticia no existe');
    }

    delete notice.user.password;

    return notice;
  }

  async update(
    id: string,
    updateNoticeDto: UpdateNoticeDto,
    userEntity?: User,
  ) {
    const notice = await this.getByUserNotice(id, userEntity);

    if (!notice) {
      throw new NotFoundException('La noticia no existe');
    }

    Object.assign(notice, updateNoticeDto);

    await this.noticeRepository.save(notice);

    return notice;
  }

  async remove(id: string, userEntity?: User) {
    const notice = await this.getByUserNotice(id, userEntity);

    if (!notice) {
      throw new NotFoundException('La noticia no existe');
    }

    return this.noticeRepository.remove(notice);
  }
}
