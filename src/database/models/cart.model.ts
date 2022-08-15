import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IUser, IBusiness } from '../modelInterfaces';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reference: string;

  @Column('boolean')
  completed: boolean;

  @Column('int')
  shopper: number;

  @Column('int')
  business: number;

  @Column()
  amount: number;

  @Column()
  quantity: number;

  @Column('timestamp')
  completed_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne('Users', 'cart')
  @JoinColumn({ name: 'shopper' })
  Shopper: IUser;

  @ManyToOne('Business', 'cart')
  @JoinColumn({ name: 'business' })
  Business: IBusiness;
}
