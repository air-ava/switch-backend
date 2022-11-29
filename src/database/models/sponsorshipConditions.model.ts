import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { ICurrency, IOrganisation, IScholarship, IStatus, IUser } from '../modelInterfaces';

@Entity('sponsorship_conditions')
export class SponsorshipConditions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  scholarship_id: string;

  @Column('double')
  minimum_amount: number;

  @Column('varchar', { default: 'USD' })
  currency: string;

  @Column('int', { default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Currency', 'sponsorship_conditions')
  @JoinColumn({ name: 'currency', referencedColumnName: 'short_code' })
  Currency: ICurrency;

  @ManyToOne('Scholarship', 'sponsorship_conditions')
  @JoinColumn({ name: 'scholarship_id', referencedColumnName: 'id' })
  Scholarship: IScholarship;

  @OneToOne('Status', 'sponsorship_conditions')
  @JoinColumn({ name: 'status', referencedColumnName: 'id' })
  Status: IStatus;
}
