/* eslint-disable import/no-cycle */
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tracking } from './Tracking';
import { Users } from './Users';

@Entity()
export class Addresses {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Users)
  @JoinColumn()
  user: Users;

  @ManyToOne(() => Tracking)
  tracking: Tracking;

  @Column('text')
  address: string;

  @Column('text')
  country: string;

  @Column('text')
  state: string;

  @Column('text')
  city: string;

  @Column('text')
  business_mobile: string;

  @Column('text')
  type: string;

  @Column('boolean')
  default: boolean;

  @Column('boolean')
  deleted: boolean;

  @Column('timestamp with time zone')
  deleted_at: Date;

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone')
  updated_at: Date;
}
