import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity('reservedAccountsTransactions')
export class ReservedAccountsTransaction {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  walletId: number;

  @Column({ type: 'int' })
  transactionId: number;

  @Column({ type: 'decimal', precision: 20, scale: 4, default: 0, unsigned: true })
  amount: number;

  @Column({ type: 'varchar' })
  originator_account_name: string;

  @Column({ type: 'varchar' })
  originator_account_number: string;

  @Column({ type: 'varchar' })
  bank_name: string;

  @Column({ type: 'varchar', nullable: true })
  bank_routing_number: string;

  @Column({ type: 'varchar', nullable: true })
  bank_code: string;

  @Column({ type: 'varchar', default: 'STEWARD', nullable: true })
  processor: string;

  @Column({ type: 'varchar', nullable: true })
  sessionId: string;

  @Column({ type: 'varchar', nullable: true })
  response: string;

  @Column({ type: 'varchar', nullable: true })
  narration: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
