import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { ICurrency, IScholarship, IStatus } from '../modelInterfaces';

@Entity('sponsorships')
export class Sponsorships {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  scholarship_id: string;

  @Column()
  accept_contribution: string;

  @Column('double')
  minimum_amount: number;

  @Column('varchar', { default: 'USD' })
  currency: string;

  @Column()
  fees_paid_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Currency', 'scholarships')
  @JoinColumn({ name: 'currency', referencedColumnName: 'short_code' })
  Currency: ICurrency;

  @ManyToOne('Scholarship', 'sponsorships')
  @JoinColumn({ name: 'scholarship_id', referencedColumnName: 'id' })
  Scholarship: IScholarship;
}
