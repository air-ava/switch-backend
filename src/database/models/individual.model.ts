import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { IUser, IBusiness, IAddresses, IAddress, IOrganisation, IPhoneNumber, IStudentGuardian } from '../modelInterfaces';

@Entity('individual')
export class Individual {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  gender: 'male' | 'female' | 'others';

  @Column()
  type: string;

  @Column('int')
  avatar: number;

  @Column('int')
  job_title: number;

  @Column('int')
  status: number;

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
  Organisation: IOrganisation;

  @ManyToOne('StudentGuardian', 'individual')
  @JoinColumn({ name: 'id', referencedColumnName: 'individualId' })
  Guardian: IStudentGuardian;
}
