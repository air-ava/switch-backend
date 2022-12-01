import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { IAssets, ILink, IScholarship, IScholarshipRequirement } from '../modelInterfaces';
import { Assets } from './assets.model';
import { ScholarshipRequirement } from './scholarshipRequirement.model';
import { Link } from './link.model';

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
  eligible_school: string;

  @Column()
  education_level: string;

  @Column()
  link_reference?: string;

  @Column()
  asset_reference?: string;

  @Column()
  state: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Scholarship', 'scholarship_eligibility')
  @JoinColumn({ name: 'scholarship_id', referencedColumnName: 'id' })
  Scholarship: IScholarship;

  @OneToMany(() => Assets, (asset) => asset.Scholarship)
  Assets: IAssets[];

  @OneToMany(() => Link, (link) => link.Scholarship)
  Links: ILink[];

  @OneToMany(() => ScholarshipRequirement, (requirement) => requirement.Requirements)
  Requirements: IScholarshipRequirement[];
}
