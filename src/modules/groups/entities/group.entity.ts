import { Event } from '../../events/entities/event.entity';
import { UserToGroup } from '../../users/entities/userToGroup.entity';
import { Category } from '../../categories/entities/category.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column({ default: 0 })
  modified: number;

  @Column({ type: 'bool', default: true, nullable: false })
  status: boolean;

  @OneToMany(() => UserToGroup, (userToGroup) => userToGroup.group, {
    onDelete: 'CASCADE',
  })
  userToGroups: UserToGroup[];

  @OneToOne(() => Category, (category) => category.group, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  Categories: Category;

  @OneToMany(() => Event, (event) => event.group)
  events: Event[];

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
