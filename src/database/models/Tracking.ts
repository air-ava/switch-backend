/* eslint-disable import/no-cycle */
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Addresses } from './Addresses';
import { Orders } from './Order';

@Entity()
export class Tracking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  reference: string;

  @ManyToOne(() => Orders)
  order: Orders;

  @OneToMany(() => Addresses, (address) => address.tracking)
  address: Addresses[];

  @Column('int')
  location_address_id: number;

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone')
  updated_at: Date;
}
