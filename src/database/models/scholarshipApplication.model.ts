import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IAssets, ILink, IPhoneNumber, IScholarship, IStatus, IUser } from '../modelInterfaces';
import { Assets } from './assets.model';
import { Link } from './link.model';
// import { Addresses } from './Addresses';
// import { Orders } from './Order';

@Entity('scholarship_applications')
export class ScholarshipApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  scholarship_id: string;

  @Column('text')
  first_name: string;

  @Column('text')
  last_name: string;

  @Column('text')
  email: string;

  @Column('text')
  code?: string;

  @Column('text')
  phone_number: string;

  @Column('text')
  education_level: string;

  @Column('text')
  address: string;

  @Column('text')
  country: string;

  @Column('text')
  state: string;

  @Column('text')
  area: string;

  @Column('text')
  city: string;

  @Column('text')
  facebook: string;

  @Column('text')
  linkedin: string;

  @Column('text')
  twitter: string;

  @Column('text')
  website: string;

  @Column('text')
  essay: string;

  @Column('text')
  link: string;

  @Column('text')
  document: string;

  @Column('text')
  image: string;

  @Column('text')
  filenames: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @Column('int')
  phone: number;

  @Column('int')
  address_id: number;

  @Column()
  document_reference: string;

  @Column()
  user: string;

  @Column('int', { default: 1 })
  status: number;

  @Column('int', { default: 1 })
  social: number;

  @ManyToOne('Scholarship', 'scholarship_applications')
  @JoinColumn({ name: 'scholarship_id', referencedColumnName: 'id' })
  Scholarship: IScholarship;

  @OneToOne('Status', 'scholarship_applications')
  @JoinColumn({ name: 'status', referencedColumnName: 'id' })
  Status: IStatus;

  @OneToMany(() => Assets, (asset) => asset.Application)
  Assets: IAssets[];

  @OneToMany(() => Link, (link) => link.Application)
  Links: ILink[];

  //   @OneToOne('PhoneNumbers', 'scholarship_applications')
  //   @JoinColumn({ name: 'phone' })
  //   phoneNumber: IPhoneNumber;

  //   @OneToOne('Address', 'scholarship_applications')
  //   @JoinColumn({ name: 'address_id' })
  //   Address: IAddress;

  //   @ManyToOne('Users', 'scholarship_applications')
  //   @JoinColumn({ name: 'user', referencedColumnName: 'id' })
  //   User: IUser;

  //   @OneToMany(() => Document, (doc) => doc.reference)
  //   Documents: Document[];
}
