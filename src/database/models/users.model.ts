import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IPhoneNumber } from '../modelInterfaces';
// import { Addresses } from './Addresses';
// import { Orders } from './Order';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  email: string;

  @Column('text')
  first_name: string;

  @Column('text')
  last_name: string;

  @Column('int')
  phone_number: number;

  @Column('text')
  password: string;

  @Column('boolean')
  enabled: boolean;

  @Column('boolean')
  is_business: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('PhoneNumbers', 'users')
  @JoinColumn({ name: 'phone_number' })
  phone: IPhoneNumber;
}
