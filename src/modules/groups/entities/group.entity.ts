import { Event } from '../../events/entities/event.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ nullable: true })
  imagen: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'bool', default: true, nullable: false })
  status: boolean;

  @ManyToOne(() => User, (user) => user.groups, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Event, (event) => event.group, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  events: Event[];

  @UpdateDateColumn()
  modifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
