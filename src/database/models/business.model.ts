import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { IPhoneNumber, IUser } from '../modelInterfaces';
import { Product } from './product.model';
// import { User } from './user';

@Entity('business')
export class Business {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('boolean')
  active: boolean;

  @Column({ nullable: true })
  logo: string;

  @Column()
  phone_number: string;

  @Column('int')
  owner: number;

  @Column('text')
  reference: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('PhoneNumbers', 'users')
  @JoinColumn({ name: 'phone_number' })
  phone: IPhoneNumber;

  @ManyToOne('Users', 'business')
  @JoinColumn({ name: 'owner' })
  owners: IUser;

  @OneToMany(() => Product, (product) => product.Business)
  product: Product[];
}
