import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { IStudent } from '../modelInterfaces';

@Entity('student_class')
export class StudentClass {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column()
  classId: number;

  @Column()
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Student', 'student_class')
  @JoinColumn({ name: 'studentId', referencedColumnName: 'id' })
  Student: IStudent;
}
