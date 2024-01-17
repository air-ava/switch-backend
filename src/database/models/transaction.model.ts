import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne, OneToMany, ManyToOne } from 'typeorm';
import { IAssets, ICashDeposit, ICurrency, ISettlementTransactions, IStatus, IUser, IWallets } from '../modelInterfaces';
import { Assets } from './assets.model';

@Entity('transactions')
export class Transactions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reference: string;

  @Column()
  walletId: number;

  @Column('int', { default: 14, nullable: false })
  status: number;

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

  @OneToMany(() => Assets, (asset) => asset.Transaction)
  Reciepts: IAssets[];

  @OneToOne('Status', 'transactions')
  @JoinColumn({ name: 'status', referencedColumnName: 'id' })
  Status: IStatus;

  @ManyToOne('SettlementTransactions', 'transactions')
  @JoinColumn({ name: 'reference', referencedColumnName: 'tx_reference' })
  Settlement: ISettlementTransactions;

  @ManyToOne('CashDeposit', 'transactions')
  @JoinColumn({ name: 'reference', referencedColumnName: 'transaction_reference' })
  CashDeposit: ICashDeposit;

  @ManyToOne('BankTransfers', 'transactions')
  @JoinColumn({ name: 'reference', referencedColumnName: 'tx_reference' })
  BankTransfer: ISettlementTransactions;

  @ManyToOne('ProductTransactions', 'transactions')
  @JoinColumn({ name: 'reference', referencedColumnName: 'tx_reference' })
  ProductTransaction: ISettlementTransactions;
}
