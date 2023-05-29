import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { IStudent } from '../modelInterfaces';

@Entity('class_level')
export class ClassLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  education_level: string;

  @Column()
  class: string;

  @Column()
  class_short_name: string;

  @Column('varchar', { default: 'UGANDA', nullable: false })
  country: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
