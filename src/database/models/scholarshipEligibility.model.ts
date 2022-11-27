import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { ICurrency, IScholarship, IStatus } from '../modelInterfaces';

@Entity('scholarship_eligibility')
export class ScholarshipEligibility {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  scholarship_id: string;

  @Column()
  applicant_description: string;

  @Column()
  submission_requirements: string;

  @Column()
  essay_requirements: string;

  @Column()
  link_requirements: string;

  @Column()
  file_requirements: string;

  @Column()
  image_requirements: string;

  @Column()
  specific_schools: boolean;

  @Column()
  eligible_schools: string;

  @Column()
  education_level: string;

  @Column()
  state: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Scholarship', 'scholarship_eligibility')
  @JoinColumn({ name: 'scholarship_id', referencedColumnName: 'id' })
  Scholarship: IScholarship;
}
