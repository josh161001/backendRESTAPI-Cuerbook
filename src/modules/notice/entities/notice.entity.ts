import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
@Entity()
export class Notice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 256 })
  name: string;

  @Column({ nullable: true })
  imagen: string;

  @Column({ nullable: true })
  fecha: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  modified: number;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  modifiedAt: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'bool', default: true })
  status: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  async updateModified() {
    if (typeof this.modified !== 'number') {
      this.modified = 0;
    }
    this.modified++; // Incrementa el contador de modificacion
  }

  @ManyToOne((type) => User, (User) => User.notice, {}) //se hace la relacion de uno a muchos
  @JoinColumn({ name: 'userId' })
  user: User;
}
