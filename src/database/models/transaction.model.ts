import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import { ICurrency, IUser, IWallets } from '../modelInterfaces';

@Entity('transactions')
export class Transactions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reference: string;

  @Column()
  walletId: number;

  @Column()
  description?: string;

  @Column()
  purpose: string;

  @Column()
  userId: string;

  @Column()
  note: string;

  @Column()
  document_reference: string;

  @Column()
  balance_before: number;

  @Column()
  balance_after: number;

  @Column()
  channel: string;

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

  @OneToOne('Users', 'transactions')
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  User: IUser;

  @OneToOne('Wallets', 'transactions')
  @JoinColumn({ name: 'walletId', referencedColumnName: 'id' })
  Wallet: IWallets;

  // @OneToOne('Currency', 'transactions')
  // @JoinColumn({ name: 'currency', referencedColumnName: 'short_code' })
  // Currency: ICurrency;
}
