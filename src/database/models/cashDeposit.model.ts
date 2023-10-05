import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cash_deposits')
export class CashDeposit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  student_id: number;

  @Column()
  recorded_by: number;

  @Column({ nullable: true })
  completed_by: number;

  @Column()
  payer_id: number;

  @Column({ nullable: true })
  longitude: string;

  @Column({ nullable: true })
  latitude: string;

  @Column()
  school_id: number;

  @Column({ default: 'UGX' })
  currency: string;

  @Column({ type: 'decimal', precision: 20, scale: 4, default: 0 })
  amount: number;

  @Column()
  class_id: number;

  @Column({ nullable: true })
  period_id: number;

  @Column()
  session_id: number;

  @Column()
  beneficiary_product_id: number;

  @Column()
  status: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  reciept_reference: string;

  @Column({ nullable: true })
  transaction_reference: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;
}
