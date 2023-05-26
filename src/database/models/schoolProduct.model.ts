import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('school_product')
export class SchoolProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  feature_name: string;

  @Column()
  paymentTypeId: number;

  @Column()
  description: string;

  @Column()
  image: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({ nullable: true })
  schoolClassId: number;

  @Column()
  schoolId: number;

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
}
