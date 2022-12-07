import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class CardTransactions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  processor: string;

  @Column()
  user_id: string;

  @Column('text')
  tx_reference: string;

  @Column('text')
  processor_response: string;

  @Column('text')
  processor_transaction_id: string;

  @Column('text')
  processor_transaction_reference: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
