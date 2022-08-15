import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IUser, IBusiness } from '../modelInterfaces';

@Entity('addresses')
export class Addresses {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  street: string;

  @Column()
  country: string;

  @Column()
  state: string;

  @Column()
  city: string;

  @Column('boolean')
  active: boolean;

  @Column('boolean')
  default: boolean;

  @Column('int')
  shopper?: number;

  @Column('int')
  business?: number;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne('Users', 'addresses')
  @JoinColumn({ name: 'shopper' })
  Shopper: IUser;

  @ManyToOne('Business', 'addresses')
  @JoinColumn({ name: 'business' })
  Business: IBusiness;
}
