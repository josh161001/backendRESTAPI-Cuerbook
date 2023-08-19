import { hash } from 'bcrypt';
import { UserToGroup } from './userToGroup.entity';
import { UserToEvent } from './userToEvent.entity';
import { Notice } from '../../notice/entities/notice.entity';
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

  @Column({ length: 60, nullable: false, select: false })
  password: string;

  @Column({ nullable: true })
  imagen: string;

  @Column({ type: 'bool', default: true, nullable: false })
  status: boolean;

  @Column({ type: 'simple-array', nullable: true })
  roles: string[]; //

  @OneToMany(() => UserToGroup, (userToGroup) => userToGroup.user)
  groups: UserToGroup[];

  @OneToMany(() => UserToEvent, (userToEvent) => userToEvent.user)
  events: UserToEvent[];

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
