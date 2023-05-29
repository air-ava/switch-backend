import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('school_period')
export class SchoolPeriod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  school_id: number;

  @Column()
  education_level: string;

  @Column()
  period: string;

  @Column()
  schedule_id: number;
  
  @Column()
  session_id: number;

  @Column()
  country: string;

  @Column()
  status: number;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @Column({ unique: true })
  code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
