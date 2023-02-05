import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IAddress, IAssets, IPhoneNumber } from '../modelInterfaces';
// import { Addresses } from './Addresses';
// import { Orders } from './Order';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  email: string;

  @Column('text')
  first_name: string;

  @Column('text')
  last_name: string;

  @Column('text')
  other_name: string;

  @Column('text')
  image: string;

  @Column('text')
  title: string;

  @Column('text')
  employer: string;

  @Column('int')
  organisation: number;

  @Column('text')
  job_title: string;

  @Column('text')
  industry_skills: string;

  @Column('text')
  job_status: string;

  @Column('text')
  country: string;

  @Column('text')
  state: string;

  @Column('text')
  area: string;

  @Column('text')
  city: string;

  @Column('text')
  bio: string;

  @Column('text')
  provider: string;

  @Column('text')
  provider_id: string;

  @Column('text')
  facebook: string;

  @Column('text')
  linkedin: string;

  @Column('text')
  twitter: string;

  @Column('text')
  website: string;

  @Column('text')
  slug: string;

  @Column('text')
  address: string;

  @Column('text')
  instagram: string;

  @Column('text')
  logo: string;

  @Column('text')
  organisation_email: string;

  @Column('text')
  organisation_headline: string;

  @Column('text')
  organisation_bio: string;

  @Column('text')
  organisation_code: string;

  @Column('text')
  organisation_phone: string;

  @Column('text')
  organisation_address: string;

  @Column('text')
  organisation_country: string;

  @Column('text')
  organisation_state: string;

  @Column('text')
  organisation_area: string;

  @Column('text')
  organisation_city: string;

  @Column('text')
  user_type: string;

  @Column('text')
  business_name: string;

  @Column('text')
  remember_token: string | null;

  @Column('text')
  code?: string;

  @Column('text')
  phone?: string;

  @Column('int')
  phone_number: number;

  @Column('text')
  password: string;

  @Column('int')
  address_id: number;

  @Column('int')
  avatar: number;

  // @Column('boolean')
  // is_business: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  email_verified_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @OneToOne('PhoneNumbers', 'users')
  @JoinColumn({ name: 'phone_number' })
  phoneNumber: IPhoneNumber;

  @OneToOne('Addresses', 'users')
  @JoinColumn({ name: 'address_id' })
  Address: IAddress;

  @OneToOne('Assets', 'users')
  @JoinColumn({ name: 'avatar' })
  Avatar: IAssets;
}
