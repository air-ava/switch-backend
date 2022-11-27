import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('assets')
export class Assets {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  file_name: string;

  @Column('int')
  status: number;

  @Column({ nullable: true })
  file_type: string;

  @Column()
  file_format: string;

  @Column()
  bytes: number;

  @Column()
  url: string;

  @Column('int')
  organisation: number;

  @Column('text')
  user: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
