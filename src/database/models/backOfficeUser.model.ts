import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IAddress, IAssets, IOrganisation, IPhoneNumber } from '../modelInterfaces';
// import { Addresses } from './Addresses';
// import { Orders } from './Order';

@Entity('backOfficeUsers')
export class BackOfficeUsers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  code: string;

  @Column('text')
  email: string;

  @Column('text')
  name: string;

  @Column('text')
  slug: string;

  @Column('text')
  role: string;

  @Column('text')
  remember_token: string | null;

  @Column('text')
  password: string;

  @Column('int')
  avatar: number;

  @Column()
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  email_verified_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @OneToOne('Assets', 'users')
  @JoinColumn({ name: 'avatar' })
  Avatar: IAssets;
}

export const countryMapping: { [key: string]: string } = {
  UG: 'UGANDA',
};
