import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('school_class')
export class SchoolClass {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  status: number;

  @Column()
  classId: number;

  @Column()
  schoolId: number;

  @Column({ unique: true })
  code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
