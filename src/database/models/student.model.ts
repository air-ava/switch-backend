import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { IUser, ISchools } from '../modelInterfaces';

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
}
