import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IAssets, IBankAccounts, ITransactions, IWallets } from '../modelInterfaces';
import { Transactions } from './transaction.model';
import { Assets } from './assets.model';

@Entity('bankTransfers')
export class BankTransfers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  walletId: number;

  @Column({ type: 'decimal', precision: 20, scale: 4 })
  amount: number;

  @Column('int')
  bankId: number;

  @Column('int')
  status: number;

  @Column('text')
  tx_reference: string;

  @Column('text')
  narration: string;

  @Column('text')
  processor: string;

  @Column('text')
  response: string;

  @Column('text')
  sessionId: string;

  @Column('text')
  document_reference: string;

  @Column('text')
  metadata: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Wallets', 'bankTransfers')
  @JoinColumn({ name: 'walletId', referencedColumnName: 'id' })
  Wallet: IWallets;

  @OneToOne('BankAccounts', 'bankTransfers')
  @JoinColumn({ name: 'bankId', referencedColumnName: 'id' })
  Bank: IBankAccounts;

  @OneToOne('Assets', 'bankTransfers')
  @JoinColumn({ name: 'document_reference', referencedColumnName: 'reference' })
  Assets: IAssets[];

  @OneToMany(() => Transactions, (transaction) => transaction.BankTransfer)
  Transactions: ITransactions[];
}
