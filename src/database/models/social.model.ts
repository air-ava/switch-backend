import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { IScholarshipEligibility } from '../modelInterfaces';

@Entity('socials')
export class Social {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  link: string;

  @Column('int')
  status: number;

  @Column()
  handle: string;

  @Column()
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  //   @ManyToOne('ScholarshipEligibility', 'assets')
  //   @JoinColumn({ name: 'reference', referencedColumnName: 'asset_reference' })
  //   Scholarship: IScholarshipEligibility;
}
