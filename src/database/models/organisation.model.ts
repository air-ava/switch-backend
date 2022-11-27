import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { IPhoneNumber, IUser } from '../modelInterfaces';
import { Product } from './product.model';
// import { User } from './user';

@Entity('organisations')
export class Organisation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  bio: string;

  @Column('int')
  status: number;

  @Column({ nullable: true })
  logo: string;

  @Column()
  phone_number: string;

  @Column()
  owner: string;

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

  @OneToOne('Assets', 'organisation')
  @JoinColumn({ name: 'logo' })
  logoId: IUser;
}
