import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { User } from '../users/entities/user.entity';
import { UserToGroup } from '../users/entities/userToGroup.entity';
import { Category } from '../categories/entities/category.entity';
import { GroupsService } from './groups.service';
@Module({
  imports: [TypeOrmModule.forFeature([Group, User, UserToGroup, Category])],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
