import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('beneficiary_product_payment')
export class BeneficiaryProductPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  beneficiaryType: string;

  @Column()
  beneficiaryId: number;

  @Column()
  productId: number;

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
