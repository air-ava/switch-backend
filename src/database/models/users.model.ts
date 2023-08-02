import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IAddress, IAssets, IJobTitle, IOrganisation, IPhoneNumber, IStudent } from '../modelInterfaces';
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
  code?: string;

  @Column('text')
  phone?: string;

  @Column('text')
  image: string;

  @Column('text')
  title: string;

  @Column('int')
  organisation: number;

  @Column('text')
  job_title: string;

  @Column('text')
  country: string;

  @Column('text')
  provider: string;

  @Column('text')
  provider_id: string;

  @Column('text')
  slug: string;

  @Column('text')
  organisation_email: string;

  @Column('text')
  user_type: string;

  @Column('text')
  business_name: string;

  @Column('text')
  remember_token: string | null;

  @Column('int')
  phone_number: number;

  @Column('text')
  password: string;

  @Column('text')
  gender: 'male' | 'female' | 'others';

  @Column('int')
  address_id: number;

  @Column('int')
  avatar: number;

  @Column('int')
  status: number;

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

  @OneToOne('Student', 'users')
  @JoinColumn({ name: 'id', referencedColumnName: 'userId' })
  Student: IStudent;

  @OneToOne('Assets', 'users')
  @JoinColumn({ name: 'avatar' })
  Avatar: IAssets;

  @OneToOne('JobTitle', 'users')
  @JoinColumn({ name: 'job_title' })
  JobTitle: IJobTitle;

  @OneToOne('Organisation', 'users')
  @JoinColumn({ name: 'organisation' })
  Organization: IOrganisation;
}

export const countryMapping: { [key: string]: string } = {
  UG: 'UGANDA',
};
