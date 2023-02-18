import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { IUser, IBusiness, IAddresses, IAddress, IOrganisation, IPhoneNumber } from '../modelInterfaces';

@Entity('schools')
export class Schools {
  @PrimaryGeneratedColumn()
  id: number;

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
}
