import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { IClassLevel, ISchoolSession, ISchools, IStudent } from '../modelInterfaces';

@Entity('student_class')
export class StudentClass {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  studentId: number;

  @Column()
  classId: number;

  @Column()
  status: number;

  @Column()
  session: number;

  @Column()
  school_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Student', 'student_class')
  @JoinColumn({ name: 'studentId', referencedColumnName: 'id' })
  student: IStudent;

  @OneToOne('ClassLevel', 'student_class')
  @JoinColumn({ name: 'classId', referencedColumnName: 'id' })
  ClassLevel: IClassLevel;

  @ManyToOne('Student', 'student_class')
  @JoinColumn({ name: 'studentId', referencedColumnName: 'id' })
  Student: IStudent;

  @OneToOne('Schools', 'student_class')
  @JoinColumn({ name: 'school_id' })
  School: ISchools;

  // @OneToMany(() => StudentClass, (class) => class.Student)
  // class: StudentClass[];

  @ManyToOne('ClassLevel', 'student_class')
  @JoinColumn({ name: 'classId', referencedColumnName: 'id' })
  Class_Level: IClassLevel;

  @OneToOne('SchoolSession', 'school_product')
  @JoinColumn({ name: 'session' })
  Session: ISchoolSession;
}
