import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { StudentClass } from './studentClass.model';

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

  @OneToMany(() => StudentClass, (classLevel) => classLevel.Class_Level)
  Classes: StudentClass[];
}
