import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';
import { Group } from '../../groups/entities/group.entity';

@Entity()
export class UserToGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Group, (group) => group.userToGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @ManyToOne(() => User, (user) => user.groups)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;
}
