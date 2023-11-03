import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { NoticeService } from './notice.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { ApiTags } from '@nestjs/swagger';
import { InjectRolesBuilder, RolesBuilder } from 'nest-access-control';
import { AppResource } from 'src/app.roles';
import { Auth } from 'src/common/decorator/auth.decorator';
import { User } from 'src/common/decorator/user.decorator';
import { User as UserEntity } from '../users/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { imagenFileFilter, renameImage } from '../users/helpers/upload.helper';

@ApiTags('notice')
@Controller('notice')
export class NoticeController {
  constructor(
    private readonly noticeService: NoticeService,
    @InjectRolesBuilder()
    private readonly rolesBuilder: RolesBuilder,
  ) {}

  @Auth({
    resource: AppResource.notice,
    action: 'create',
    possession: 'any',
  })
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './upload',
        filename: renameImage,
      }),
      fileFilter: imagenFileFilter,
    }),
  )
  @Post()
  async create(
    @UploadedFile() imagen: Express.Multer.File,
    @Body() createNoticeDto: CreateNoticeDto,
    @User() user: UserEntity,
  ) {
    if (!imagen) {
      throw new BadRequestException('imagen requerida');
    }

    const baseUrl = 'http://localhost:5000';

    createNoticeDto.imagen = `${baseUrl}/upload/${imagen.filename}`;

    const data = await this.noticeService.create(createNoticeDto, user);

    return {
      message: 'Noticia creada con éxito',
      data: data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.noticeService.findAll();

    return {
      message: 'Noticias obtenidas con éxito',
      data: data,
    };
  }
  @Get('noticias')
  async findNoticiasCTLR() {
    const data = await this.noticeService.findNoticias();

    return {
      message: 'Noticias obtenidas con éxito',
      data: data,
    };
  }

  @Get('total')
  async getTotalCount() {
    const totalNotices = await this.noticeService.getTotalNotices();

    return {
      message: 'Noticias obtenidas con éxito',
      data: totalNotices,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const noticia = await this.noticeService.findOne(id);

    return {
      message: 'Noticia obtenida con éxito',
      data: noticia,
    };
  }

  @Auth({
    resource: AppResource.notice,
    action: 'update',
    possession: 'any',
  })
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './upload',
        filename: renameImage,
      }),
      fileFilter: imagenFileFilter,
    }),
  )
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNoticeDto: UpdateNoticeDto,
    @User() user: UserEntity,
    @UploadedFile() imagen: Express.Multer.File,
  ) {
    const fs = require('fs');

    if (imagen) {
      const grupo = await this.noticeService.findOne(id);
      const imagenUrl = grupo.imagen.split('/').pop();

      fs.unlink(`./upload/${imagenUrl}`, (error) => {
        if (error) throw error;
      });

      const baseUrl = 'http://localhost:5000';
      updateNoticeDto.imagen = `${baseUrl}/upload/${imagen.filename}`;
    } else {
      const grupo = await this.noticeService.findOne(id);

      if (grupo && grupo.imagen) {
        updateNoticeDto.imagen = grupo.imagen;
      }
    }

    const data = await this.noticeService.update(id, user);

    return {
      message: 'Noticia actualizada con éxito',
      data: data,
    };
  }

  @Auth({
    resource: AppResource.notice,
    action: 'delete',
    possession: 'any',
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const fs = require('fs');

    const notice = await this.noticeService.findOne(id);

    const imagenUrl = notice.imagen.split('/').pop();

    fs.unlink(`./upload/${imagenUrl}`, (error) => {
      if (error) throw error;
    });

    const data = await this.noticeService.remove(id);

    return {
      message: 'Noticia eliminada con éxito',
      data: data,
    };
  }
}
