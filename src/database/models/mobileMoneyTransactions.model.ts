import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { IAssets, ICurrency, IStatus, IUser, IWallets } from '../modelInterfaces';
import { Assets } from './assets.model';

@Entity('mobileMoneyTransactions')
export class MobileMoneyTransactions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tx_reference: string;

  @Column('int', { default: 14, nullable: false })
  status: number;

  @Column('varchar', { default: 'BEYONIC', nullable: false })
  processor: string;

  @Column()
  processor_transaction_id: string;

  @Column()
  response: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Status', 'mobileMoneyTransactions')
  @JoinColumn({ name: 'status', referencedColumnName: 'id' })
  Status: IStatus;
}
