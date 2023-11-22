import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiTags } from '@nestjs/swagger';
import { EmailDto } from './dto/email.dto';
import { UpdatePasswordUserDto } from './dto/updatePasswordUser.dto';

@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerServices: MailService) {}

  @Post('enviar-instrucciones')
  async enviarInsruccion(@Body() emailDto: EmailDto) {
    await this.mailerServices.enviarCorreoDeRecuperacion(emailDto.email);
    return { message: 'Correo de recuperación enviado exitosamente.' };
  }

  @Get('verificar-token/:token')
  async verificarToken(@Param('token') token: string) {
    return await this.mailerServices.verificaToken(token);
  }

  @Patch('actualizar-password/:token')
  async actualizarPassword(
    @Param('token') token: string,
    @Body() updatePasswordUser: UpdatePasswordUserDto,
  ) {
    const user = await this.mailerServices.actualizarPassword(
      token,
      updatePasswordUser,
    );

    return user;
  }
}
