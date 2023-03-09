import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { IStatus, ITransactions } from '../modelInterfaces';
import { Transactions } from './transaction.model';

@Entity('settlementTransactions')
export class SettlementTransactions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { default: 'BEYONIC', nullable: false })
  processor: string;

  @Column()
  processor_transaction_id: string;

  @Column()
  response: string;

  @Column()
  tx_reference: string;

  @Column()
  tx_count: number;

  @Column('int', { nullable: false })
  bankId: number;

  @Column('json')
  metadata: { [key: string]: string | number };

  @Column('int', { default: 14, nullable: false })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Status', 'settlementTransactions')
  @JoinColumn({ name: 'status', referencedColumnName: 'id' })
  Status: IStatus;

  @OneToOne('Transactions', 'settlementTransactions')
  @JoinColumn({ name: 'tx_reference', referencedColumnName: 'reference' })
  Transaction: ITransactions;

  @OneToMany(() => Transactions, (transaction) => transaction.Settlement)
  Transactions: ITransactions[];
}
