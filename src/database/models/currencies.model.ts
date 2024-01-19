import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ICurrencyRate, IScholarship, IStatus } from '../modelInterfaces';
import { CurrencyRate } from './currencyRate.model';
// eslint-disable-next-line import/no-cycle
import { Scholarship } from './schorlaship.model';

@Entity('currencies')
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  code: string;

  @Column()
  short_code: string;
 
  @Column()
  country: string;

  @Column()
  currency_name: string;

  @Column()
  currency_unit_name: string;

  @Column()
  status: number;

  @Column()
  icon?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @OneToOne('Status', 'currencies')
  @JoinColumn({ name: 'status' })
  Status: IStatus;

  @OneToMany(() => CurrencyRate, (currRate) => currRate.Currency)
  CurrencyRate: ICurrencyRate[];

  @OneToMany(() => Scholarship, (scholarship) => scholarship.Currencies)
  Scholarships: IScholarship[];
}

export const CURRENCIES: any = {
  NIGERIA: 'NGN',
  UGANDA: 'UGX',
};
