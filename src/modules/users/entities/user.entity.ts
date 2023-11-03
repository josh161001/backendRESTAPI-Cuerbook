import { Group } from './../../groups/entities/group.entity';
import { hash } from 'bcrypt';
import { Notice } from '../../notice/entities/notice.entity';
import { Event } from '../../events/entities/event.entity';
import {
  UpdateDateColumn,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ length: 255, unique: true, nullable: false })
  email: string;

  @Column({ length: 60, nullable: false })
  password: string;

  @Column({ nullable: true })
  imagen: string;

  @Column({ type: 'bool', default: true, nullable: false })
  status: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: false })
  roles: string[]; //

  @Column({ nullable: true })
  token: string;

  @OneToMany(() => Group, (groups) => groups.user, { onDelete: 'CASCADE' })
  groups: Group[];

  @OneToMany(() => Event, (event) => event.user, { onDelete: 'CASCADE' })
  events: Event[];

  @OneToMany(() => Notice, (notice) => notice.user, { onDelete: 'CASCADE' }) //crea la relacion de uno a muchos en la tabla notice
  notice: Notice[];

  @UpdateDateColumn()
  modifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
