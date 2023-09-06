import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('auditLogs') // Use the table name as specified in your migration
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  code?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  event?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: 'backOfficeUsers' })
  user_type?: string;

  @Column({ type: 'int', nullable: true })
  user_id?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  table_type?: string;

  @Column({ type: 'int', nullable: true })
  table_id?: number;

  @Column({ type: 'text', nullable: true })
  initial_state?: string;

  @Column({ type: 'text', nullable: true })
  delta?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
