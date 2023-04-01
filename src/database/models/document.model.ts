import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { STATUSES } from './status.model';
import { IAssets, ILink, IStatus } from '../modelInterfaces';
import { Assets } from './assets.model';
import { Link } from './link.model';

@Entity('documents')
export class Documents {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reference: string;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: true })
  metadata: string;

  @Column('int', { default: STATUSES.UNVERIFIED, nullable: false })
  status: number;

  @Column()
  number: string;

  @Column('int')
  asset_id: string;

  @Column('int')
  link_id: number;

  @Column({ default: 'smileID', nullable: true })
  processor: string;

  @Column()
  response: string;

  @Column('varchar', { default: 'UGANDA', nullable: false })
  country: string;

  @Column()
  trigger: string;

  @Column({ nullable: true })
  entity: string;

  @Column({ nullable: true })
  entity_id: string;

  @Column()
  expiry_date?: Date;

  @Column()
  issuing_date?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne('Status', 'documents')
  @JoinColumn({ name: 'status' })
  Status: IStatus;

  @OneToOne('Assets', 'documents')
  @JoinColumn({ name: 'asset_id' })
  Asset: IStatus;

  @OneToMany(() => Assets, (asset) => asset.Document)
  Assets: IAssets[];

  @OneToMany(() => Link, (link) => link.Application)
  Links: ILink[];
}
