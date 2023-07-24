import { hash } from 'bcrypt';
import {
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 256 })
  name: string;

  @Column({ length: 256, unique: true, nullable: false })
  email: string;

  @Column({ length: 60 })
  password: string;

  @Column({ nullable: true })
  imagen: string;

  @Column({ default: 0 })
  modified: number;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  modifiedAt: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: 'admin' })
  rol: string;

  @Column({ type: 'bool', default: true })
  status: boolean;

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

    this.modified++; // Incrementar el contador de modificacion
  }
}
