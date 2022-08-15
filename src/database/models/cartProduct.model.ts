import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { ICart, IProduct } from '../modelInterfaces';

@Entity('cart_product')
export class CartProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column('int')
  product: number;

  @Column('int')
  cart: number;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne('Cart', 'cart_product')
  @JoinColumn({ name: 'cart' })
  Cart: ICart;

  @ManyToOne('Product', 'cart_product')
  @JoinColumn({ name: 'product' })
  Product: IProduct;
}
