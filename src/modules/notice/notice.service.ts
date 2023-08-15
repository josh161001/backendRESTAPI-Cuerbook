import { Injectable } from '@nestjs/common';
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

  async create(id: string, createNoticeDto: CreateNoticeDto): Promise<Notice> {
    const user = await this.userRespository.findOne({ where: { id } });

    if (!user) {
      throw new Error('El usuario no existe');
    }

    const nameNotice = await this.noticeRepository.findOne({
      where: { name: createNoticeDto.name },
    });

    if (nameNotice) {
      throw new Error('La noticia ya está registrada');
    }

    const notice: Notice = this.noticeRepository.create({
      ...createNoticeDto,
      user,
    });

    const saveNotice: Notice = await this.noticeRepository.save(notice);

    return saveNotice;
  }

  findAll(): Promise<Notice[]> {
    const Notices = this.noticeRepository.find({
      relations: ['user'],
    });
    return Notices;
  }

  async findOne(id: string): Promise<Notice> {
    const notice = await this.noticeRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notice) {
      throw new Error('La noticia no existe');
    }
    return notice;
  }

  async update(id: string, updateNoticeDto: UpdateNoticeDto) {
    const notice = await this.noticeRepository.findOne({
      where: { id },
    });

    if (!notice) {
      throw new Error('La noticia no existe');
    }

    Object.assign(notice, updateNoticeDto);

    await this.noticeRepository.save(notice);

    return notice;
  }

  remove(id: string) {
    return this.noticeRepository.delete(id);
  }
}
