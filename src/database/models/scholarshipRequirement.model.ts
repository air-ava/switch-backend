import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { IUser, IBusiness, IAddresses, IScholarshipEligibility, IStatus, IScholarshipRequirementB, IAssets, ILink } from '../modelInterfaces';
import { Assets } from './assets.model';
import { Link } from './link.model';

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

  @OneToMany(() => Link, (link) => link.Requirement)
  Links: ILink[];

  @OneToMany(() => Assets, (asset) => asset.Requirement)
  Assets: IAssets[];
}
