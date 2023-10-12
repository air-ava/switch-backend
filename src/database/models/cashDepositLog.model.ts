import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { ICashDeposit, IDevice, IUser } from '../modelInterfaces';

@Entity('cash_deposits_logs')
export class CashDepositLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  cash_deposits_id: number;

  @Column()
  initiator_id: string;

  @Column()
  device_id: number;

  @Column({
    type: 'enum',
    enum: ['CREATED', 'UPDATED', 'DELETED'],
  })
  action: 'CREATED' | 'UPDATED' | 'DELETED';

  @Column({ type: 'text', nullable: true })
  state_before: string;

  @Column({ type: 'text', nullable: true })
  state_after: string;

  @Column({ nullable: true })
  longitude: string;

  @Column({ nullable: true })
  latitude: string;

  @Column()
  ip_address: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @ManyToOne('CashDeposit', 'cash_deposits_logs')
  @JoinColumn({ name: 'cash_deposits_id', referencedColumnName: 'id' })
  CashDeposit: ICashDeposit;

  @OneToOne('Users', 'cash_deposits_logs')
  @JoinColumn({ name: 'initiator_id', referencedColumnName: 'id' })
  User: IUser;

  @OneToOne('Device', 'cash_deposits_logs')
  @JoinColumn({ name: 'device_id', referencedColumnName: 'id' })
  Device: IDevice;
}
