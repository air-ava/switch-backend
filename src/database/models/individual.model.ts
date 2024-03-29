import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import {
  IUser,
  IBusiness,
  IAddresses,
  IAddress,
  IOrganisation,
  IPhoneNumber,
  IStudentGuardian,
  ISchools,
  IAssets,
  IJobTitle,
} from '../modelInterfaces';

@Entity('individual')
export class Individual {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column({ unique: true })
  code: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  gender: 'male' | 'female' | 'others';

  @Column()
  type: string;

  @Column()
  is_owner: boolean;

  @Column('int')
  avatar: number;

  @Column('int')
  job_title: number;

  @Column()
  dob: Date;

  @Column()
  nationality: string;

  @Column('int')
  status: number;

  @Column('int')
  verification_status: number;

  @Column()
  document_reference: string;

  @Column()
  onboarding_reference: string;

  @Column()
  username: string;

  @Column()
  metadata: string;

  @Column('int')
  school_id: number;

  @Column('int')
  phone_number: number;

  @Column('int')
  address_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('PhoneNumbers', 'individual')
  @JoinColumn({ name: 'phone_number' })
  phoneNumber: IPhoneNumber;

  @OneToOne('Addresses', 'individual')
  @JoinColumn({ name: 'address_id' })
  Address: IAddress;

  @OneToOne('Schools', 'individual')
  @JoinColumn({ name: 'school_id', referencedColumnName: 'id' })
  School: ISchools;

  @ManyToOne('StudentGuardian', 'individual')
  @JoinColumn({ name: 'id', referencedColumnName: 'individualId' })
  Guardian: IStudentGuardian;

  @OneToOne('Assets', 'individual')
  @JoinColumn({ name: 'avatar', referencedColumnName: 'id' })
  Avatar: IAssets;

  @OneToOne('JobTitle', 'individual')
  @JoinColumn({ name: 'job_title', referencedColumnName: 'id' })
  JobTitle: IJobTitle;
}
