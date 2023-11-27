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
  UnauthorizedException,
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

    const baseUrl = 'https://cuerbook-backend.onrender.com';

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
  @Get('total')
  async getTotalCount() {
    const totalNotices = await this.noticeService.getTotalNotices();

    return {
      message: 'Noticias obtenidas con éxito',
      data: totalNotices,
    };
  }

  @Get('noticiasasc')
  async findNoticiasAsc() {
    const data = await this.noticeService.getTakeNoticesAsc();

    return {
      message: 'Noticias obtenidas con éxito',
      data: data,
    };
  }

  @Get('noticiasdesc')
  async findNoticiasDesc() {
    const data = await this.noticeService.getTakeNoticesDesc();

    return {
      message: 'Noticias obtenidas con éxito',
      data: data,
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
    let data;
    const fs = require('fs');

    if (
      this.rolesBuilder.can(user.roles).updateAny(AppResource.notice).granted
    ) {
      if (imagen) {
        const notice = await this.noticeService.findOne(id);

        if (notice && notice.imagen) {
          const imagenUrl = notice.imagen.split('/').pop();
          const imagePath = `./upload/${imagenUrl}`;

          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath, (error) => {
              if (error) {
                console.log(error);
              } else {
                console.log('Imagen eliminada');
              }
            });
          }
        } else {
          const baseUrl = 'https://cuerbook-backend.onrender.com';
          notice.imagen = `${baseUrl}/upload/${imagen.filename}`;
          await this.noticeService.update(id, { imagen: notice.imagen });
        }
        const baseUrl = 'https://cuerbook-backend.onrender.com';
        updateNoticeDto.imagen = `${baseUrl}/upload/${imagen.filename}`;
      } else {
        const notice = await this.noticeService.findOne(id);
        if (notice && notice.imagen) {
          updateNoticeDto.imagen = notice.imagen;
        }
      }
      data = await this.noticeService.update(id, updateNoticeDto);
    } else {
      throw new UnauthorizedException(
        'No tienes permisos para actualizar esta noticia',
      );
    }

    return { message: 'Usuario actualizado', data };
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

    if (notice && notice.imagen) {
      const imagenUrl = notice.imagen.split('/').pop();
      const imagePath = `./upload/${imagenUrl}`;

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath, (error) => {
          if (error) {
            console.log(error);
          } else {
          }
        });
      } else {
        console.log('La imagen no existe en la ruta actual.');

        notice.imagen = null;
        await this.noticeService.update(id, { imagen: notice.imagen });
      }
    } else {
      console.log('No existe la imagen');
    }

    const data = await this.noticeService.remove(id);

    return {
      message: 'Noticia eliminada con correctamente',
      data: data,
    };
  }
}
