import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('addresses')
export class Addresses {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  street: string;

  @Column()
  area: string;

  @Column('varchar', { default: 'Nigeria' })
  country: string;

  @Column()
  state: string;

  @Column()
  city: string;

  @Column('int')
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
