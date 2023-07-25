import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IBeneficiaryProductPayment, IPaymentContacts, IStudentClass, ITransactions } from '../modelInterfaces';
import { Transactions } from './transaction.model';

@Entity('product_transactions')
export class ProductTransactions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tx_reference: string;
  
  @Column()
  session: string;

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
  
  @Column()
  student_class: number;

  @Column({ unique: true })
  code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne('BeneficiaryProductPayment', 'product_transactions')
  @JoinColumn({ name: 'beneficiary_product_payment_id' })
  Fee: IBeneficiaryProductPayment;

  @OneToOne('BeneficiaryProductPayment', 'product_transactions')
  @JoinColumn({ name: 'beneficiary_product_payment_id' })
  beneficiaryFee: IBeneficiaryProductPayment;
  
  @OneToOne('PaymentContacts', 'product_transactions')
  @JoinColumn({ name: 'payer' })
  Payer: IPaymentContacts;

  @OneToMany(() => Transactions, (transaction) => transaction.ProductTransaction)
  Transactions: ITransactions[];

  @OneToOne('StudentClass', 'product_transactions')
  @JoinColumn({ name: 'student_class', referencedColumnName: 'id' })
  StudentClass: IStudentClass;
}
