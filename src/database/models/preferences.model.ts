import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('preferences')
export class Preference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 21 })
  code: string;

  @Column()
  entity: string;

  @Column()
  entity_id: number;

  @Column('json')
  configuration: JSON;

  @Column()
  status: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date | null;
}
