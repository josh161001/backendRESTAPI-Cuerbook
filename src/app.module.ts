// config module
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlModule } from 'nest-access-control';

//modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GroupsModule } from './modules/groups/groups.module';
import { EventsModule } from './modules/events/events.module';
import { NoticeModule } from './modules/notice/notice.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { roles } from './app.roles';

//database config
import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_SSL,
  DATABASE_USERNAME,
  PORT,
} from './config/config.keys';

import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import InitSeeder from './database/seeds/init.seeder';
import { MailerModule } from './modules/mailer/mail.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>(DATABASE_HOST),
        port: parseInt(config.get<string>(DATABASE_PORT), 10),
        username: config.get<string>(DATABASE_USERNAME),
        password: config.get<string>(DATABASE_PASSWORD),
        database: config.get<string>(DATABASE_NAME),
        synchronize: true,
        autoLoadEntities: true,
        ssl: config.get<string>(DATABASE_SSL) === 'true',
        extra: {
          ssl:
            config.get<string>(DATABASE_SSL) === 'true'
              ? {
                  rejectUnauthorized: false,
                }
              : null,
        },
        dropSchema: false,
        entities: ['dist/**/**/*.entity{.js,.ts}'],
        migrations: ['dist/database/migrations/*{.js,.ts}'],
      }),
    }),

    AccessControlModule.forRoles(roles),
    AuthModule,
    UsersModule,
    ConfigModule,
    EventsModule,
    GroupsModule,
    NoticeModule,
    CategoriesModule,
    MailerModule,
    PdfModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  static port: number | string;
  constructor(private readonly configService: ConfigService) {
    AppModule.port = this.configService.get(PORT);
  }
  // crea un usuario admin por defecto por seeder
  async onModuleInit() {
    const app = await NestFactory.create(AppModule);
    const dataSource = app.get(DataSource);
    const initSeeder = new InitSeeder();
    await initSeeder.run(dataSource);
  }
}
