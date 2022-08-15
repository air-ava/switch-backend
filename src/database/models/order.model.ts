import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IUser, IBusiness, IAddresses } from '../modelInterfaces';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reference: string;

  @Column()
  payment_reference: string;

  @Column('int')
  shopper_address: number;

  @Column('int')
  business_address: number;

  @Column('int')
  shopper: number;

  @Column('int')
  business: number;

  @Column()
  external_reference: string;

  @Column()
  cart_reference: string;

  @Column('json')
  metadata: { [key: string]: any };

  @Column('timestamp')
  processed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne('Users', 'transactions')
  @JoinColumn({ name: 'shopper' })
  Shopper: IUser;

  @ManyToOne('Business', 'transactions')
  @JoinColumn({ name: 'business' })
  Business: IBusiness;

  @ManyToOne('Addresses', 'order')
  @JoinColumn({ name: 'shopper_address' })
  ShoppeAddress: IAddresses;

  @ManyToOne('Addresses', 'order')
  @JoinColumn({ name: 'business_address' })
  BusinessAddress: IAddresses;
}
