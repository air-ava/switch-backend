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

  @Column({
    type: 'enum',
    enum: ['CREATED', 'UPDATED', 'DELETED'],
  })
  action: 'CREATED' | 'UPDATED' | 'DELETED';

  @Column({ nullable: true })
  action_target: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;
}
