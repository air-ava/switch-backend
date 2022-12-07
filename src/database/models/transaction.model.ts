import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import { ICurrency } from '../modelInterfaces';

@Entity('transactions')
export class Transactions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reference: string;

  @Column()
  user_id: string;

  @Column()
  description?: string;

  @Column()
  purpose: string;

  @Column()
  response: string;

  @Column()
  currency: string;

  @Column()
  amount: number;

  @Column()
  txn_type: 'debit' | 'credit';

  @Column('json')
  metadata: { [key: string]: string | number };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Currency', 'transactions')
  @JoinColumn({ name: 'currency', referencedColumnName: 'short_code' })
  Currency: ICurrency;
}
