// config module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// entities
import { User } from './modules/users/entities/user.entity';
import { UserToGroup } from './modules/users/entities/userToGroup.entity';
import { Group } from './modules/groups/entities/group.entity';
import { Event } from './modules/events/entities/event.entity';
import { Notice } from './modules/notice/entities/notice.entity';
import { UserToEvent } from './modules/users/entities/userToEvent.entity';
//modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GroupsModule } from './modules/groups/groups.module';
import { EventsModule } from './modules/events/events.module';
import { NoticeModule } from './modules/notice/notice.module';
import { CategoriesModule } from './modules/categories/categories.module';

import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_USERNAME,
  PORT,
} from './config/config.keys';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
        // entities: [User, UserToGroup, Group, UserToEvent, Event, Notice],
        synchronize: true,
        dropSchema: false,
        entities: ['dist/**/**/*.entity{.js,.ts}'],
        migrations: ['dist/database/migrations/*{.js,.ts}'],
      }),
    }),

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
}
