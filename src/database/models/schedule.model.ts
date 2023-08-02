import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('schedule')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cron_id: string;

  @Column()
  status: number;

  @Column()
  cron_expression: string;

  @Column({ unique: true })
  code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
