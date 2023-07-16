import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IBeneficiaryProductPayment } from '../modelInterfaces';

@Entity('product_transactions')
export class ProductTransactions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tx_reference: string;

  @Column()
  beneficiary_product_payment_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  outstanding_before: number;

  @Column()
  outstanding_after: number;

  @Column()
  payer: number;

  @Column('json')
  metadata: { [key: string]: number | string };

  @Column()
  status: number;

  @Column({ unique: true })
  code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne('BeneficiaryProductPayment', 'product_transactions')
  @JoinColumn({ name: 'beneficiary_product_payment_id' })
  Fee: IBeneficiaryProductPayment;
}
