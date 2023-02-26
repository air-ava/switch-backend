import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { IAssets, ICurrency, IStatus, IUser, IWallets } from '../modelInterfaces';
import { Assets } from './assets.model';

@Entity('third_party_logs')
export class ThirdPartyLogs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  event: string;

  @Column()
  message: string;

  @Column()
  endpoint: string;

  @Column()
  school: number;

  @Column()
  endpoint_verb: string;

  @Column()
  status_code: string;

  @Column('varchar', { default: 'payment-provider', nullable: false })
  provider_type: string;

  @Column('varchar', { default: 'BEYONIC', nullable: false })
  provider: string;

  @Column()
  payload: string;
  
  @Column()
  reference: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
