/* eslint-disable import/no-cycle */
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Addresses } from './Addresses';
import { Tracking } from './Tracking';
import { Users } from './Users';

@Entity()
export class Orders {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  image_url: string;

  @Column('boolean')
  picked_up: boolean;

  @Column('boolean')
  delivered: boolean;

  @Column('text')
  reference: string;

  @Column('text')
  payment_reference: string;

  @Column('text')
  status: string;

  @Column('text')
  tracking_ref: string;

  @Column('text')
  item_name: string;

  @Column({ type: 'decimal', precision: 20, scale: 4 })
  item_amount: number;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  weight: number;

  @ManyToOne(() => Users, (user) => user.orders)
  user: Users;

  @ManyToOne(() => Addresses, (address) => address.id)
  pickup: Addresses;

  @ManyToOne(() => Addresses, (address) => address.id)
  delivery: Addresses;

  @OneToMany(() => Tracking, (track) => track.order)
  tracking: Tracking[];

  @Column('boolean')
  cancelled: boolean;

  @Column('timestamp with time zone')
  cancelled_at: Date;

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone')
  processed_at: Date;

  @Column('timestamp with time zone')
  updated_at: Date;
}
