import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('product_transactions')
export class ProductTransactions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tx_reference: string;

  @Column()
  beneficiaryProductPaymentId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  payer: number;

  @Column('json')
  metadata: { payment_method: string; bank_details: string; mobile_money_details: string; card_details: string };

  @Column()
  status: number;

  @Column({ unique: true })
  code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
