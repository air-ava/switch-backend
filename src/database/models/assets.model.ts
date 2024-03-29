import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import {
  IBankTransfers,
  ICashDeposit,
  IDocuments,
  IScholarshipApplication,
  IScholarshipEligibility,
  IScholarshipRequirement,
  ITransactions,
} from '../modelInterfaces';

@Entity('assets')
export class Assets {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  file_name: string;

  @Column('int')
  status: number;

  @Column({ nullable: true })
  file_type: string;

  @Column()
  file_format: string;

  @Column()
  bytes: number;

  @Column()
  reference: string;

  @Column()
  trigger: string;

  @Column({ nullable: true })
  entity: string;

  @Column({ nullable: true })
  entity_id: string;

  @Column()
  url: string;

  @Column('int')
  organisation: number;

  @Column('text')
  user: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne('ScholarshipEligibility', 'assets')
  @JoinColumn({ name: 'reference', referencedColumnName: 'asset_reference' })
  Scholarship: IScholarshipEligibility;

  @ManyToOne('ScholarshipApplication', 'assets')
  @JoinColumn({ name: 'reference', referencedColumnName: 'id' })
  Application: IScholarshipApplication;

  @ManyToOne('Transactions', 'assets')
  @JoinColumn({ name: 'reference', referencedColumnName: 'document_reference' })
  Transaction: ITransactions;

  @ManyToOne('CashDeposit', 'assets')
  @JoinColumn({ name: 'reference', referencedColumnName: 'reciept_reference' })
  CashDeposit: ICashDeposit;

  @ManyToOne('Documents', 'assets')
  @JoinColumn({ name: 'reference', referencedColumnName: 'reference' })
  Document: IDocuments;

  @ManyToOne('BankTransfers', 'assets')
  @JoinColumn({ name: 'reference', referencedColumnName: 'document_reference' })
  BankTransfers: IBankTransfers;

  @ManyToOne('ScholarshipRequirement', 'assets')
  @JoinColumn({ name: 'entity_id', referencedColumnName: 'id' })
  Requirement: IScholarshipRequirement;
}
