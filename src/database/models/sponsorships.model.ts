import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { ICurrency, IOrganisation, IScholarship, IStatus, IUser } from '../modelInterfaces';

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

  @Column()
  user: string;

  @Column()
  payment_type: string;

  @Column()
  frequency: string;

  @Column()
  organisation: number;

  @Column()
  status: number;

  @Column()
  anonymous: boolean;

  @Column()
  take_transaction_charge: boolean;

  @OneToOne('Currency', 'scholarships')
  @JoinColumn({ name: 'currency', referencedColumnName: 'short_code' })
  Currency: ICurrency;

  @ManyToOne('Scholarship', 'sponsorships')
  @JoinColumn({ name: 'scholarship_id', referencedColumnName: 'id' })
  Scholarship: IScholarship;

  @OneToOne('Users', 'sponsorships')
  @JoinColumn({ name: 'user', referencedColumnName: 'id' })
  User: IUser;

  @OneToOne('Organisation', 'sponsorships')
  @JoinColumn({ name: 'organisation', referencedColumnName: 'id' })
  Organisation: IOrganisation;

  @OneToOne('Status', 'sponsorships')
  @JoinColumn({ name: 'status', referencedColumnName: 'id' })
  Status: IStatus;
}
