import { Group } from './../../groups/entities/group.entity';
import { hash } from 'bcrypt';
import { Notice } from '../../notice/entities/notice.entity';
import { Event } from '../../events/entities/event.entity';
import {
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
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

  @Column({ type: 'simple-array', nullable: true })
  roles: string[]; //

  @Column({ nullable: true })
  token: string;

  @OneToMany(() => Group, (groups) => groups.user, { onDelete: 'CASCADE' })
  groups: Group[];

  @OneToMany(() => Event, (event) => event.user, { onDelete: 'CASCADE' })
  events: Event[];

  @OneToMany(() => Notice, (notice) => notice.user, { onDelete: 'CASCADE' }) //crea la relacion de uno a muchos en la tabla notice
  notice: Notice[];

  @Column({ default: 0, nullable: false })
  modified: number;

  @UpdateDateColumn()
  modifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hasPassword() {
    if (!this.password) {
      return; // si no hay contraseña no hace nada
    }

    this.password = await hash(this.password, 10);

    if (typeof this.modified !== 'number') {
      this.modified = 0;
    }

    this.modified++; // Incrementa el contador de modificacion
  }
}
