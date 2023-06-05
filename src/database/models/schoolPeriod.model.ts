import { Schedule } from './../../integrations/extra/cron.integrations';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IEducationPeriod, ISchoolSession } from '../modelInterfaces';

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

  @OneToOne('SchoolSession', 'school_period')
  @JoinColumn({ name: 'session_id' })
  Session: ISchoolSession;

  @OneToOne('Schedule', 'school_period')
  @JoinColumn({ name: 'schedule_id' })
  Schedule: Schedule;

  @OneToOne('EducationPeriod', 'school_period')
  @JoinColumn({ name: 'period', referencedColumnName: 'feature_name' })
  Period: IEducationPeriod;
}
