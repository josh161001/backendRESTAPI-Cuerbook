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

import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_USERNAME,
  PORT,
} from './config/config.keys';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import InitSeeder from './database/seeds/init.seeder';

@Module({
  imports: [
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
        dropSchema: false,
        entities: ['dist/**/**/*.entity{.js,.ts}'],
        migrations: ['dist/database/migrations/*{.js,.ts}'],
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AccessControlModule.forRoles(roles),
    AuthModule,
    UsersModule,
    ConfigModule,
    EventsModule,
    GroupsModule,
    NoticeModule,
    CategoriesModule,
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
