import { AfterLoad, BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import randomstring from 'randomstring';

@Entity('paymentType')
export class PaymentType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  value: string;

  @Column()
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @BeforeInsert()
  generateCode() {
    // Generate a random 17-character alphanumeric string
    this.code = `pty_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`;
  }
}

export const PAYMENT_TYPE = {
  INSTALLMENTAL: 1,
  LUMP_SUM: 2,
  NO_PAYMENT: 3,
};
