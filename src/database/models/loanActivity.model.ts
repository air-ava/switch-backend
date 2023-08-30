import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('loan_activities')
export class LoanActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  code: string;

  @Column({ type: 'varchar' })
  entity: string;

  @Column({ type: 'int' })
  entityId: number;

  @Column({ type: 'varchar' })
  stage: string;

  @Column({ type: 'varchar' })
  responsibleParty: string;

  @Column({ type: 'int' })
  responsiblePartyId: number;

  @Column({ type: 'varchar', nullable: true })
  notes: string;

  @Column({ type: 'int', default: 20 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;
}
