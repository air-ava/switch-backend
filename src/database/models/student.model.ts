import { StudentGuardian } from './studentGuardian.model';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { IUser, ISchools } from '../modelInterfaces';
import { StudentClass } from './studentClass.model';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  schoolId: number;

  @Column()
  uniqueStudentId: string;

  @Column()
  userId: string;

  @Column()
  status: number;

  @Column()
  paymentTypeId: number;

  @Column()
  defaultEmail: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Users', 'students')
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  User: IUser;

  @OneToOne('Schools', 'students')
  @JoinColumn({ name: 'schoolId', referencedColumnName: 'id' })
  School: ISchools;

  // @ManyToOne('StudentClass', 'students')
  // @JoinColumn({ name: 'studentId', referencedColumnName: 'id' })
  // StudentClasses: StudentClass;

  @OneToMany(() => StudentClass, (classLevel) => classLevel.Student)
  Classes: StudentClass[];

  @OneToMany(() => StudentGuardian, (guardian) => guardian.Student)
  StudentGuardians: StudentGuardian[];
}
