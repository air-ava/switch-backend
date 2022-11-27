import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ICurrency } from '../modelInterfaces';

@Entity('currency_rate')
export class CurrencyRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currency: string;

  @Column()
  base_currency: string;

  @Column({ type: 'decimal', precision: 20, scale: 4 })
  buy_rate: number;

  @Column({ type: 'decimal', precision: 20, scale: 4 })
  sell_rate: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne('Currency', 'currency_rate')
  @JoinColumn({ name: 'currency', referencedColumnName: 'short_code' })
  Currency: ICurrency;
}
