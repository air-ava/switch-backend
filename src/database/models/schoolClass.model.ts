import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IClassLevel, ISchoolProduct, ISchools } from '../modelInterfaces';
import { SchoolProduct } from './schoolProduct.model';

@Entity('school_class')
export class SchoolClass {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  status: number;

  @Column()
  class_id: number;

  @Column()
  school_id: number;

  @Column({ unique: true })
  code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('ClassLevel', 'student_class')
  @JoinColumn({ name: 'class_id', referencedColumnName: 'id' })
  ClassLevel: IClassLevel;

  @OneToOne('Schools', 'school_product')
  @JoinColumn({ name: 'school_id' })
  School: ISchools;

  @OneToMany(() => SchoolProduct, (fee) => fee.SchoolClasses)
  Fees: ISchoolProduct[];
}
