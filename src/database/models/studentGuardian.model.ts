import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import randomstring from 'randomstring';
import { IClassLevel, IIndividual, IStudent } from '../modelInterfaces';
import { Individual } from './individual.model';

@Entity('studentGuardian')
export class StudentGuardian {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  relationship: string;

  @Column()
  studentId: number;

  @Column()
  individualId: number;

  @Column()
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Student', 'studentGuardian')
  @JoinColumn({ name: 'studentId', referencedColumnName: 'id' })
  student: IStudent;

  @OneToMany(() => Individual, (individual) => individual.Guardian)
  Guardian: IIndividual[];

  @BeforeInsert()
  generateCode() {
    // Generate a random 17-character alphanumeric string
    this.code = `stg_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`;
  }
}
