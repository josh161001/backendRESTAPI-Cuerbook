import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { User } from '../users/entities/user.entity';
import { UserToGroup } from '../users/entities/userToGroup.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Group, User, UserToGroup])],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
