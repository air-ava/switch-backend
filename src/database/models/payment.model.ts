import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import { IOrganisation, IStatus, IUser } from '../modelInterfaces';
// import { User } from './user';

@Entity('pending_payments')
export class PendingPayments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  org_id: number;

  @Column()
  reference: string;

  @Column()
  sender_id: string;

  @Column()
  recipient_id: string;

  @Column()
  applied_to: string;

  @Column()
  applied_id: string;

  @Column()
  description: string;

  @Column('int')
  status: number;

  @Column('double')
  amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne('Users', 'pending_payments')
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
  Sender: IUser;

  @ManyToOne('Users', 'pending_payments')
  @JoinColumn({ name: 'recipient_id', referencedColumnName: 'id' })
  Recipient: IUser;

  @ManyToOne('Organisation', 'pending_payments')
  @JoinColumn({ name: 'org_id', referencedColumnName: 'id' })
  Organisation: IOrganisation;

  @OneToOne('Status', 'pending_payments')
  @JoinColumn({ name: 'status', referencedColumnName: 'id' })
  Status: IStatus;
}
