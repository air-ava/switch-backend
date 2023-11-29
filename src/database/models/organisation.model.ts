import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { IIndividual, IPhoneNumber, IScholarship, IStatus, IUser } from '../modelInterfaces';
import { Product } from './product.model';
import { Scholarship } from './schorlaship.model';
// import { User } from './user';

@Entity('organisations')
export class Organisation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;
  
  @Column()
  business_type: string;

  @Column()
  email: string;

  @Column()
  bio: string;

  @Column('int')
  status: number;

  @Column()
  type: string;

  @Column({ nullable: true })
  logo: string;

  @Column()
  phone_number: string;

  @Column()
  owner: string;

  @Column('int')
  onboarding_status: number;
  
  @Column()
  onboarding_reference: string;
  
  @Column()
  document_reference: string;

  @Column('text')
  slug: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('PhoneNumbers', 'organisation')
  @JoinColumn({ name: 'phone_number' })
  phone: IPhoneNumber;

  @ManyToOne('Users', 'organisation')
  @JoinColumn({ name: 'owner' })
  owners: IUser;

  @OneToMany(() => Scholarship, (scholarship) => scholarship.Organisation)
  Scholarships: IScholarship[];

  @OneToOne('Status', 'organisation')
  @JoinColumn({ name: 'status', referencedColumnName: 'id' })
  Status: IStatus;

  @OneToOne('Users', 'organisation')
  @JoinColumn({ name: 'owner' })
  Owner: IUser;

  // @OneToOne('Individual', 'organisation')
  // @JoinColumn({ name: 'owner' })
  // Individual: IIndividual;

  @OneToOne('Assets', 'organisation')
  @JoinColumn({ name: 'logo' })
  LogoId: IUser;
}

export const businessType: any = {
  'sole proprietorship': 'SOLE_PROPITOR',
  'limited liability': 'LIMITED_LIABILITY',
};
