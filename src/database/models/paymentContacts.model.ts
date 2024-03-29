import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('payment_contacts')
export class PaymentContacts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name?: string;

  @Column()
  school: number;

  @Column()
  phone_number?: string;

  @Column()
  address_id?: number;

  @Column()
  email?: string;

  @Column()
  relationship?: string;

  @Column()
  gender?: string;

  @Column()
  status: number;

  @Column({ unique: true })
  code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
