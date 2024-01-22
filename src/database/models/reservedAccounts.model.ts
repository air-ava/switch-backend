import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import { IStudent, IWallets } from '../modelInterfaces';
import { Student } from './student.model';
import { Wallets } from './wallets.model';

@Entity('reserved_accounts')
export class ReservedAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

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

  @Column()
  reason: string;

  @Column()
  blocked_by: string;

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

  @OneToOne('Wallets', 'reserved_accounts')
  @JoinColumn({ name: 'wallet_id', referencedColumnName: 'id' })
  Wallet: IWallets;

  @OneToOne('Student', 'reserved_accounts')
  @JoinColumn({ name: 'entity_id', referencedColumnName: 'id' })
  Student: IStudent;

  @ManyToOne(() => Student, (student) => student.ReservedAccounts)
  @JoinColumn({ name: 'entity_id', referencedColumnName: 'id' })
  Students: IStudent;

  // @ManyToOne(() => Wallets, (wallet) => wallet.ReservedAccounts)
  // @JoinColumn({ name: 'entity_id', referencedColumnName: 'entity_id' })
  // Wallets: IWallets;
}
