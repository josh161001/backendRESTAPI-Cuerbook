import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerController } from './mailer.controller';
import { MailerModule as MailerModules } from '@nestjs-modules/mailer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';

@Module({
  imports: [
    MailerModules.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        secure: false,
        auth: {
          user: 'estrella161610@gmail.com',
          pass: 'fzgw xsqy ucwf eenv ',
        },
      },
      defaults: {
        from: '"admin@cuerbook.com" <admin@admin.cuerbook.com>',
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [MailerController],
  providers: [MailService],
  exports: [MailService],
})
export class MailerModule {}
