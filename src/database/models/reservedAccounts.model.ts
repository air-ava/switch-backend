import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import { IWallets } from '../modelInterfaces';

@Entity('reserved_accounts')
export class ReservedAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  reserved_account_number: string;

  @Column({ type: 'varchar' })
  reserved_account_name: string;

  @Column({ type: 'varchar' })
  reserved_bank_name: string;

  @Column({ type: 'varchar' })
  processor: string;

  @Column({ type: 'int' })
  status: number;

  @Column({ type: 'varchar', default: 'wallet' })
  entity: string;

  @Column({ type: 'int' })
  entity_id: number;

  @Column({ type: 'int' })
  wallet_id: number;

  @Column({ type: 'varchar', default: 'permanent' })
  type: string;

  @Column({ type: 'varchar', default: 'NIGERIA' })
  country: string;

  @Column({ type: 'timestamp', nullable: true })
  expired_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updated_at: Date;

  @Column({ type: 'varchar', nullable: true })
  reserved_bank_code: string | null;

  @Column({ type: 'tinyint' })
  is_default: boolean;

  @OneToOne('Wallets', 'transactions')
  @JoinColumn({ name: 'wallet_id', referencedColumnName: 'id' })
  Wallet: IWallets;
}
