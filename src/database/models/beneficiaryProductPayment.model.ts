import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IProductTransactions, ISchoolProduct, IStudent } from '../modelInterfaces';
import { ProductTransactions } from './productTransactions.model';

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

  @OneToOne('SchoolProduct', 'beneficiary_product_payment')
  @JoinColumn({ name: 'product_id' })
  Fee: ISchoolProduct;

  @OneToOne('Student', 'beneficiary_product_payment')
  @JoinColumn({ name: 'beneficiary_id' })
  Student: IStudent;

  @OneToMany(() => ProductTransactions, (transaction) => transaction.Fee)
  FeesHistory: IProductTransactions[];

  @ManyToOne('Student', 'beneficiary_product_payment')
  @JoinColumn({ name: 'beneficiary_id' })
  Students: IStudent;
}
