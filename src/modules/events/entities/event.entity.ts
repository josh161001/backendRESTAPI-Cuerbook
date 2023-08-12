import { Group } from '../../groups/entities/group.entity';
import { UserToEvent } from '../../users/entities/userToEvent.entity';
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

  @OneToMany(() => UserToEvent, (userToEvent) => userToEvent.event)
  userToEvents: UserToEvent[];

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
