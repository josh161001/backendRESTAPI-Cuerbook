import { passwordDto } from './dto/password.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { MailerService as MailerServices } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { UpdatePasswordUserDto } from './dto/updatePasswordUser.dto';
import { hash } from 'bcrypt';
import { USER_EMAIL } from 'src/config/config.keys';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerServices: MailerServices,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async verificaToken(token: string) {
    const user: User = await this.userRepository.findOne({ where: { token } });

    if (!user) {
      throw new NotFoundException('El token  no existe');
    }
    delete user.password;

    return user;
  }

  async actualizarPassword(
    token: string,
    updatePasswordUser: UpdatePasswordUserDto,
  ) {
    const user: User = await this.userRepository.findOne({ where: { token } });

    if (!user) {
      throw new NotFoundException('El token  no existe');
    }

    user.token = null;
    user.password = await hash(updatePasswordUser.password, 10);

    await this.userRepository.save(user);

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async enviarCorreoDeRecuperacion(email: string, userEntity?: User) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('El correo no existe');
    }

    user.token = uuidv4();

    await this.userRepository.save(user);

    const resetLink = `http://localhost:3000/itnl/recuperar-password/${user.token}`;
    const mailContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Recupera tu contraseña</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .header {
          margin-bottom: 20px;
        }
        .header h1 {
          color: #333;
        }
        .content {
          margin-bottom: 30px;
          color: #333;
        }
        .content p {
          font-size: 18px;
          margin-bottom: 10px;
        }
        .content a {
          display: inline-block;
          padding: 10px 20px;
          background-color: #1B396A;
          color: #fff;
          text-decoration: none;
          border-radius: 5px;
          font-size: 16px;
        }
        .footer {
          color: #555;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Recupera tu contraseña</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${user.name}</strong>,</p>
          <p>Hemos recibido una solicitud para restablecer tu contraseña. Si no lo has solicitado
          ignora este mensaje. De lo contrario haz clic en el siguiente botón para continuar:</p>
          <a href="${resetLink}">Restablecer Contraseña</a>
        </div>
        <div class="footer">
          <p>Este es un mensaje automatizado, por favor no responda.</p>
          <img src="https://www.arielmendieta.com.mx/wp-content/uploads/ITNL.png" alt="ITNL Logo" style="width: 150px; height: auto;">
        </div>
      </div>
    </body>
    </html>    
    `;

    await this.mailerServices.sendMail({
      to: user.email,
      subject: 'Recupera tu contraseña',
      html: mailContent, // Usar la opción html para enviar contenido HTML
    });
  }
}
