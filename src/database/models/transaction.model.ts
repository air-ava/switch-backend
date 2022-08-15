import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IUser, IBusiness } from '../modelInterfaces';

@Entity('transactions')
export class Transactions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reference: string;

  @Column()
  description?: string;

  @Column()
  purpose: string;

  @Column()
  processor_reference: string;

  @Column()
  processor: string;

  @Column()
  response: string;

  @Column()
  amount: number;

  @Column()
  txn_type: 'debit' | 'credit';

  @Column('int')
  shopper: number;

  @Column('int')
  business: number;

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
}
