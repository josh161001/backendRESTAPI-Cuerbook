import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 256 })
  name: string;

  @Column({ nullable: true })
  imagen: string;

  @Column({ nullable: true })
  lugar: string;

  @Column({ nullable: true })
  fecha: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'bool', default: true })
  status: boolean;
}
