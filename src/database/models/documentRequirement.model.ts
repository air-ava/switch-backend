import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import { STATUSES } from './status.model';
import { IStatus } from '../modelInterfaces';

@Entity('document_requirements')
export class DocumentRequirement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  requirement_type: 'link' | 'number' | 'file' | 'text';

  @Column()
  required: boolean;

  @Column('int', { default: STATUSES.ACTIVE, nullable: false })
  status: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  type: string;

  @Column()
  process: string;

  @Column()
  tag: string;

  @Column()
  verification_type: 'MANUAL' | 'AUTO';

  @Column('varchar', { default: 'UGANDA', nullable: false })
  country: string;

  @Column()
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Status', 'currencies')
  @JoinColumn({ name: 'status' })
  Status: IStatus;
}
