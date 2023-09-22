import { Category } from 'src/modules/categories/entities/category.entity';
import { Group } from '../../groups/entities/group.entity';
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
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 256, nullable: false })
  name: string;

  @Column({ nullable: true })
  imagen: string;

  @Column({ nullable: false })
  cupo: number;

  @Column({ nullable: true })
  fecha: Date | null;

  @Column({ nullable: false })
  lugar: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ default: 0 })
  modified: number;

  @Column({ type: 'bool', default: true })
  status: boolean;

  @ManyToOne(() => Group, (group) => group.events, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @ManyToOne(() => Category, (category) => category.event, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  Categories: Category;

  @ManyToOne(() => User, (user) => user.events, {
    eager: true,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @UpdateDateColumn()
  modifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async updateModified() {
    if (typeof this.modified !== 'number') {
      this.modified = 0;
    }
    this.modified++; // Incrementa el contador de modificacion
  }
}
