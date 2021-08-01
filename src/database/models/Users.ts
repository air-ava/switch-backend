import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Addresses } from './Addresses';
import { Orders } from './Order';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  email: string;

  @Column('text')
  first_name: string;

  @Column('text')
  last_name: string;

  @Column('text')
  phone_number: string;

  @Column('text')
  password: string;

  @Column('boolean')
  is_business: boolean;

  @OneToOne(() => Addresses)
  @JoinColumn()
  address: Addresses;

  @OneToMany(() => Orders, (order) => order.user)
  orders: Orders[];

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone')
  updated_at: Date;
}
