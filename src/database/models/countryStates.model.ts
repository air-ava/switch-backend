import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('country_states')
export class CountryState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  country: string;

  @Column()
  state_district: string;

  @Column()
  code: string;
  
  @Column()
  alpha_code: string;

  @Column()
  postal_code: string;

  @Column()
  lga_cities: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
