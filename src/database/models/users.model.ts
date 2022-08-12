import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
// import { Addresses } from './Addresses';
// import { Orders } from './Order';

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

  @Column('int')
  phone_number: number;

  @Column('text')
  password: string;

  @Column('boolean')
  enabled: boolean;

  @Column('boolean')
  is_business: boolean;

  @Column('timestamp')
  created_at: Date;

  @Column('timestamp')
  updated_at: Date;
}
