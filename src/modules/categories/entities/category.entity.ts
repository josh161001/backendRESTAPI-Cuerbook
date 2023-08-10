import { Group } from '../../groups/entities/group.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  modified: number;

  @ManyToOne(() => Group, (group) => group.categories)
  @JoinColumn({ name: 'group_id' }) // Cambiar aquí el nombre de la columna de clave foránea
  group: Group;

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
