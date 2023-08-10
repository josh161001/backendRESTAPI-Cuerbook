import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity()
export class UserToEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, (event) => event.userToEvents)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;
}
