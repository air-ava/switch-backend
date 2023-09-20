import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { IAssets, IAddress, IOrganisation, IPhoneNumber, IStudent, ISchoolProduct } from '../modelInterfaces';
import { Student } from './student.model';
import { SchoolProduct } from './schoolProduct.model';

@Entity('schools')
export class Schools {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  country: string;

  @Column()
  state: string;

  @Column()
  name: string;

  @Column()
  education_level: string;

  @Column()
  email: string;

  @Column()
  description: string;

  @Column()
  document_reference: string;

  @Column()
  website: string;

  @Column()
  status: number;

  @Column('int')
  organisation_id: number;

  @Column('int')
  phone_number: number;

  @Column('int')
  address_id: number;

  @Column('int')
  logo: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('PhoneNumbers', 'schools')
  @JoinColumn({ name: 'phone_number' })
  phoneNumber: IPhoneNumber;

  @OneToOne('Addresses', 'schools')
  @JoinColumn({ name: 'address_id' })
  Address: IAddress;

  @OneToOne('Organisation', 'schools')
  @JoinColumn({ name: 'organisation_id', referencedColumnName: 'id' })
  Organisation: IOrganisation;

  @OneToOne('Assets', 'schools')
  @JoinColumn({ name: 'logo' })
  Logo: IAssets;

  @OneToMany(() => Student, (student) => student.Schools)
  Students: IStudent[];

  @OneToMany(() => SchoolProduct, (fee) => fee.FeeRecords)
  SchoolFees: ISchoolProduct[];
}
