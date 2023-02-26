import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IWallets } from '../modelInterfaces';

@Entity('lien_transaction')
export class LienTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 20, scale: 4 })
  amount: number;

  @Column('int', { default: 1, nullable: false })
  status: number;

  @Column('int')
  walletId: number;

  @Column()
  reference: string;

  @Column('json')
  metadata: { [key: string]: string | number };

  @Column('varchar', { default: 'collection-request', nullable: false })
  type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne('Wallets', 'lien_transaction')
  @JoinColumn({ name: 'walletId' })
  wallet: IWallets;
}
