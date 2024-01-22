import { Column, Entity, PrimaryGeneratedColumn, OneToMany, Unique, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import { ISchools, ITransaction, IUser } from '../modelInterfaces';

@Entity('wallets')
@Unique(['id', 'userId', 'currency', 'type', 'entity', 'entity_id'])
export class Wallets {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({ unique: true })
  userId: string;

  @Column('varchar')
  currency: string;

  @Column('varchar')
  type: 'temporary' | 'permanent';

  // 'school' | 'teacher' | 'team' | 'subaccount' | 'organisation' | 'user'
  @Column({ default: 'school', nullable: true })
  entity: string;

  @Column({ nullable: true })
  entity_id: string;

  @Column({ type: 'decimal', precision: 20, scale: 4 })
  balance: number;

  @Column({ type: 'decimal', precision: 20, scale: 4 })
  ledger_balance: number;

  @Column('text')
  uniquePaymentId: string;

  @Column('boolean')
  has_updated_unique_payment_id: boolean;

  @Column('text')
  transaction_pin: string;

  @Column()
  status: number;

  @Column()
  expiry_date?: Date;

  @Column('text')
  transaction_webhook_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany('Transactions', 'wallet')
  transactions: ITransaction[];

  @OneToOne('Users', 'wallets')
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  User: IUser;

  @OneToOne('Schools', 'wallets')
  @JoinColumn({ name: 'entity_id', referencedColumnName: 'id' })
  School: ISchools;
}
