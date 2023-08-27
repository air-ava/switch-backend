import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('mobile_money_payments')
export class MobileMoneyPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 20 })
  status: number;

  @Column('decimal', { default: 0, unsigned: true, precision: 20, scale: 4 })
  amount: number;

  @Column('decimal', { default: 0, unsigned: true, precision: 20, scale: 4 })
  fee: number;

  @Column()
  currency: string;

  @Column()
  narration: string;

  @Column()
  description: string;

  @Column()
  code: string;

  @Column()
  transaction_reference: string;

  @Column()
  processor_reference: string;

  @Column({ default: 'BEYONIC' })
  processor: string;

  @Column()
  response: string;

  @Column('json')
  metadata: JSON;

  @Column()
  receiver: number;

  @Column({ default: 'mobile-money' })
  type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
