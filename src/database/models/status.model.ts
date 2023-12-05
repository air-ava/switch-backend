import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('statuses')
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}

export const STATUSES = {
  ACTIVE: 1,
  INACTIVE: 2,
  PAUSE: 3,
  FREEZE: 4,
  BLOCKED: 5,
  VERIFIED: 6,
  UNVERIFIED: 7,
  INVITED: 8,
  CANCELLED: 9,
  DELETED: 10,
  PENDING: 11,
  APPROVED: 12,
  REJECTED: 13,
  SUCCESS: 14,
  FAILED: 15,
  DECLINED: 16,
  PAID: 17,
  PROCESSING: 18,
  PROCESSED: 19,
  INITIATED: 20,
  COMPLETED: 21,
  NEW: 22,
  LOGGED: 23,
  RESOLVED: 24,
  UNRESOLVED: 25,
  INCOMPLETE: 26,
};
