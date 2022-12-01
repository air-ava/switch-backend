import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { IUser, IBusiness, IAddresses, IScholarshipEligibility, IStatus, IScholarshipRequirementB } from '../modelInterfaces';

@Entity('scholarship_requirement')
export class ScholarshipRequirement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  reference: string;

  @Column()
  requirement_type: string;

  @Column()
  trigger: string;

  @Column()
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Status', 'scholarship_requirement')
  @JoinColumn({ name: 'status', referencedColumnName: 'id' })
  Status: IStatus;

  @ManyToOne('ScholarshipEligibility', 'scholarship_requirement')
  @JoinColumn({ name: 'trigger', referencedColumnName: 'id' })
  Requirements: IScholarshipEligibility;
}
