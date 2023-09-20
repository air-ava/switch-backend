import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IBeneficiaryProductPayment, IEducationPeriod, IPaymentType, IProductType, ISchoolClass, ISchools, ISchoolSession } from '../modelInterfaces';
import { BeneficiaryProductPayment } from './beneficiaryProductPayment.model';

@Entity('school_product')
export class SchoolProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  feature_name: string;

  @Column()
  payment_type_id: number;

  @Column()
  product_type_id: number;

  @Column()
  description: string;

  @Column()
  image: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({ nullable: true })
  school_class_id: number;

  @Column()
  school_id: number;

  @Column()
  status: number;

  @Column({ nullable: true })
  period: number;

  @Column({ nullable: true })
  session: number;

  @Column({ unique: true })
  code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('EducationPeriod', 'school_product')
  @JoinColumn({ name: 'period' })
  Period: IEducationPeriod;

  @OneToOne('PaymentType', 'school_product')
  @JoinColumn({ name: 'payment_type_id' })
  PaymentType: IPaymentType;

  @OneToOne('ProductType', 'school_product')
  @JoinColumn({ name: 'product_type_id' })
  ProductType: IProductType;

  @OneToOne('SchoolSession', 'school_product')
  @JoinColumn({ name: 'session' })
  Session: ISchoolSession;

  @OneToOne('Schools', 'school_product')
  @JoinColumn({ name: 'school_id' })
  School: ISchools;

  @OneToOne('SchoolClass', 'school_product')
  @JoinColumn({ name: 'school_class_id' })
  SchoolClass: ISchoolClass;

  @ManyToOne('SchoolClass', 'school_product')
  @JoinColumn({ name: 'school_class_id' })
  SchoolClasses: ISchoolClass;
  
  @ManyToOne('Schools', 'school_product')
  @JoinColumn({ name: 'school_id' })
  FeeRecords: ISchools;

  @OneToMany(() => BeneficiaryProductPayment, (payment) => payment.fee)
  FeesPaymentRecords: IBeneficiaryProductPayment[];
}
