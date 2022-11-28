import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { IScholarshipEligibility } from '../modelInterfaces';

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
  reference: string;

  @Column()
  trigger: string;

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

  @ManyToOne('ScholarshipEligibility', 'assets')
  @JoinColumn({ name: 'reference', referencedColumnName: 'asset_reference' })
  Scholarship: IScholarshipEligibility;
}
