import { Category } from 'src/modules/categories/entities/category.entity';
import { Group } from '../../groups/entities/group.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  fecha: Date;

  @Column({ nullable: false })
  lugar: string;

  @Column({
    type: 'text',
    nullable: true,
    default: 'aqui va la descripcion del evento',
  })
  description: string;

  @Column({ nullable: false, type: 'text' })
  detalles: string;

  @Column({ type: 'bool', default: false, nullable: false })
  status: boolean;

  @ManyToOne(() => Group, (group) => group.events, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @ManyToOne(() => Category, (category) => category.event, {
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  Categories: Category;

  @ManyToOne(() => User, (user) => user.events, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @UpdateDateColumn()
  modifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
