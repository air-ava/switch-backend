import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  code: string;

  @Column({ type: 'int' })
  initiatorType: number;

  @Column({ type: 'int' })
  initiator: number;

  @Column({ type: 'date', nullable: true })
  completion_date: Date;

  @Column({ type: 'date', nullable: true })
  approval_date: Date;

  @Column({ type: 'int' })
  schedule_id: number;

  @Column({ type: 'int' })
  status: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'int', nullable: true })
  debtServiceRatio: number;

  @Column({ type: 'varchar' })
  currency: string;

  @Column({ type: 'decimal', unsigned: true, precision: 20, scale: 4 })
  requestAmount: number;

  @Column({ type: 'decimal', unsigned: true, precision: 20, scale: 4 })
  approvedAmount: number;

  @Column({ type: 'varchar' })
  purpose: string;

  @Column({ type: 'int', nullable: true })
  interest: number;

  @Column({ type: 'decimal', unsigned: true, precision: 20, scale: 4 })
  amount_paid: number;

  @Column({ type: 'boolean', default: false })
  isPropertyCollaterized: boolean;

  @Column({ type: 'varchar', nullable: true })
  collateralReference: string;

  @Column({ type: 'varchar', nullable: true })
  documentReference: string;

  @Column({ type: 'int', default: 1 })
  penaltyStatus: number;

  @Column({ type: 'decimal', unsigned: true, precision: 20, scale: 4 })
  penalty_amount: number;

  @Column({ type: 'decimal', unsigned: true, precision: 20, scale: 4 })
  penalty_amount_paid: number;

  @Column({ type: 'int', default: 1 })
  gracePeriodStatus: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
