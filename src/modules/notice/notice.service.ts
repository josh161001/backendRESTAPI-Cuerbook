import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Not, Repository } from 'typeorm';
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
    const Notices = await this.noticeRepository.find();

    return Notices;
  }

  async getTotalNotices(): Promise<number> {
    const totalNotices = await this.noticeRepository.count();

    return totalNotices;
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

  async getTakeNoticesAsc(selectedNoticeId: string): Promise<Notice[]> {
    const notices = await this.noticeRepository.find({
      where: {
        id: Not(selectedNoticeId),
      },
      order: {
        createdAt: 'ASC',
      },
      take: 6,
    });

    return notices;
  }

  async getTakeNoticesDesc(): Promise<Notice[]> {
    const notices = await this.noticeRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 3,
    });

    return notices;
  }

  async findOne(id: string): Promise<Notice> {
    const notice = await this.noticeRepository
      .createQueryBuilder('notice')
      .leftJoin('notice.user', 'user')
      .addSelect([
        'user.id',
        'user.name',
        'user.imagen',
        'user.description',
        'user.department',
      ])
      .where('notice.id = :id', { id: id })
      .getOne();

    if (!notice) {
      throw new NotFoundException('La noticia no existe');
    }

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

    const data = await this.noticeRepository.remove(notice);

    return {
      message: 'Noticia eliminada con éxito',
      data: data,
    };
  }
}
