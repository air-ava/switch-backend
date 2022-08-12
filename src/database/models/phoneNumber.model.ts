import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
// import { Addresses } from './Addresses';
// import { Orders } from './Order';

@Entity()
export class PhoneNumbers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  countryCode: string;

  @Column('varchar')
  localFormat: string;

  @Column('varchar')
  internationalFormat: string;

  @Column('boolean')
  active: boolean;

  @Column('boolean')
  is_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
