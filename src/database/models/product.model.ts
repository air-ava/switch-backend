import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IBusiness, IPhoneNumber, IProductCategory } from '../modelInterfaces';
// import { Addresses } from './Addresses';
// import { Orders } from './Order';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reference: string;

  @Column()
  name: string;

  @Column()
  unit_price: number;

  @Column()
  quantity: number;

  @Column()
  weight: number;

  @Column()
  description: string;

  @Column()
  image_reference: string;

  @Column('int')
  product_categories: number;

  @Column('int')
  business: number;

  @Column('boolean')
  publish: boolean;

  @Column('boolean')
  unlimited: boolean;

  @Column('timestamp')
  expire_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne('Business', 'product')
  @JoinColumn({ name: 'business' })
  Business: IBusiness;

  @ManyToOne('ProductCategory', 'product')
  @JoinColumn({ name: 'product_categories' })
  Category: IProductCategory;
}
