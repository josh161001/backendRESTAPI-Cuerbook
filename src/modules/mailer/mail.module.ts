import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerController } from './mailer.controller';
import { MailerModule as MailerModules } from '@nestjs-modules/mailer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import {
  EMAIL_HOST,
  USER_EMAIL,
  USER_EMAIL_PASSWORD,
} from 'src/config/config.keys';

@Module({
  imports: [
    MailerModules.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>(EMAIL_HOST),
          secure: false,
          auth: {
            user: config.get<string>(USER_EMAIL),
            pass: config.get<string>(USER_EMAIL_PASSWORD),
          },
        },
        defaults: {
          from: '"admin@cuerbook.com" <admin@admin.cuerbook.com>',
        },
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [MailerController],
  providers: [MailService],
  exports: [MailService],
})
export class MailerModule {}
