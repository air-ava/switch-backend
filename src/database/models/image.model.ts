import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('image')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  table_type: string;

  @Column('text')
  reference: string;

  @Column('int')
  table_id: number;

  @Column('text')
  url: string;

  @Column('boolean')
  available: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
