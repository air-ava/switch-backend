import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IPhoneNumber } from '../modelInterfaces';
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
  user_type: string;
  
  @Column('text')
  business_name: string;

  @Column('text')
  remember_token: string | null;

  @Column('text')
  code?: string;

  @Column('text')
  phone?: string;

  @Column('text')
  country: string;

  @Column('int')
  phone_number: number;

  @Column('text')
  password: string;

  // @Column('boolean')
  // enabled: boolean;

  // @Column('boolean')
  // is_business: boolean;

  @CreateDateColumn()
  created_at: Date;

  @CreateDateColumn()
  email_verified_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @OneToOne('PhoneNumbers', 'users')
  @JoinColumn({ name: 'phone_number' })
  phoneNumber: IPhoneNumber;
}
