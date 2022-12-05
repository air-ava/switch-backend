import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { IUser } from '../modelInterfaces';

@Entity('cards')
export class Cards {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @Column({ length: 6 })
  first6: string;

  @Column({ length: 6 })
  last4: string;

  @Column('text')
  authorization: string;

  @Column('text')
  issuer: string;

  @Column('text')
  country: string;

  @Column('text')
  type: string;

  @Column('text')
  processor: string;

  @Column('boolean')
  default: boolean;

  @Column('int')
  status: number;

  @Column('varchar')
  currency: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @ManyToOne('Users', 'cards')
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  User: IUser;
}
