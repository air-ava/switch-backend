import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('school_session')
export class SchoolSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  education_level: string;

  @Column()
  session: string;

  @Column()
  country: string;

  @Column()
  schedule_id: number;

  @Column()
  name: string;

  @Column()
  status: number;

  @Column({ type: 'datetime' })
  start_date: Date;

  @Column({ type: 'datetime', nullable: true })
  expiry_date: Date;

  @Column({ unique: true })
  code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
