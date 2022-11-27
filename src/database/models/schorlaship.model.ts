import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, OneToOne, OneToMany } from 'typeorm';
import { ICurrency, IScholarshipApplication, IScholarshipEligibility, ISponsorships, IStatus, IUser, IAssets } from '../modelInterfaces';
import { ScholarshipApplication } from './scholarshipApplication.model';
import { Sponsorships } from './sponsorships.model';
// import { STATUSES } from './status.model';

@Entity('scholarships')
export class Scholarship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  image: string;

  @Column('double')
  amount: number;

  @Column()
  frequency: string;

  @Column('int')
  winners: number;

  @Column('varchar', { default: 'publish' })
  state: string;

  @Column('int', { default: 1 })
  status: number;

  @Column('varchar', { default: 'USD' })
  currency: string;

  @Column()
  application_deadline: Date;

  @Column()
  image_id: number;

  @Column()
  org_id: number;

  @Column()
  deadline_note: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ? Below here are all the associations
  @ManyToOne('Currency', 'scholarships')
  @JoinColumn({ name: 'currency', referencedColumnName: 'short_code' })
  Currencies: ICurrency;

  @OneToOne('Currency', 'scholarships')
  @JoinColumn({ name: 'currency', referencedColumnName: 'short_code' })
  Currency: ICurrency;

  @OneToOne('Users', 'scholarships')
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  User: IUser;

  @OneToOne('Status', 'scholarships')
  @JoinColumn({ name: 'status', referencedColumnName: 'id' })
  Status: IStatus;

  @OneToOne('ScholarshipEligibility', 'scholarships')
  @JoinColumn({ name: 'id', referencedColumnName: 'scholarship_id' })
  Eligibility: IScholarshipEligibility;

  @OneToOne('Assets', 'scholarships')
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  Image: IAssets;

  @OneToMany(() => Sponsorships, (sponsorships) => sponsorships.Scholarship)
  Sponsorships: ISponsorships[];

  @OneToMany(() => ScholarshipApplication, (application) => application.Scholarship)
  Applications: IScholarshipApplication[];
}
