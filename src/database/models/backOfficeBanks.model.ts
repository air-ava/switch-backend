import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
// import { Addresses } from './Addresses';
// import { Orders } from './Order';

@Entity('backOfficeBanks')
export class BackOfficeBanks {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  country: string;

  @Column('text')
  currency: string;

  @Column('text')
  number: string;

  @Column('text')
  account_name: string;

  @Column('text')
  bank_name: string;

  @Column()
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
