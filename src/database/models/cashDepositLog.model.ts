import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cash_deposits_logs')
export class CashDepositLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  cash_deposits_id: number;

  @Column()
  initiator_id: number;

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
}
