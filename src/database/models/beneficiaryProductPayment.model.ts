import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('beneficiary_product_payment')
export class BeneficiaryProductPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  beneficiary_type: string;

  @Column()
  product_currency: string;

  @Column()
  beneficiary_id: number;

  @Column()
  product_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount_paid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount_outstanding: number;

  @Column({ unique: true })
  code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
