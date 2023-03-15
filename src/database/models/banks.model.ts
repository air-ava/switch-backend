import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { IAssets, ICurrency, IStatus, IUser, IWallets } from '../modelInterfaces';
import { Assets } from './assets.model';

@Entity('banks')
export class Banks {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { default: 'BEYONIC', nullable: false })
  provider: string;

  @Column('varchar', { default: 'UGANDA', nullable: false })
  country: string;

  @Column('varchar')
  currency: string;

  @Column()
  walletId: number;

  @Column('int', { default: 1, nullable: false })
  status: number;

  @Column()
  number: string;

  @Column()
  type: 'owner' | 'beneficiary';

  @Column()
  account_name: string;

  @Column()
  bank_name: string;

  @Column()
  bank_code: string;

  @Column()
  bank_routing_number: string;

  @Column('json')
  metadata: { [key: string]: string | number };

  @Column()
  default: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Wallets', 'banks')
  @JoinColumn({ name: 'walletId', referencedColumnName: 'id' })
  Wallet: IWallets;

  @OneToOne('Status', 'banks')
  @JoinColumn({ name: 'status', referencedColumnName: 'id' })
  Status: IStatus;
}
