import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { IScholarshipEligibility } from '../modelInterfaces';

@Entity('links')
export class Link {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  link: string;

  @Column('int')
  status: number;

  @Column({ nullable: true })
  trigger: string;

  @Column({ nullable: true })
  entity: string;

  @Column({ nullable: true })
  entity_id: string;

  @Column()
  reference: string;

  @Column('int')
  organisation: number;

  @Column('text')
  user: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne('ScholarshipEligibility', 'links')
  @JoinColumn({ name: 'reference', referencedColumnName: 'link_reference' })
  Scholarship: IScholarshipEligibility;
}
