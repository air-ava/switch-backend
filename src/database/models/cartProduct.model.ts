import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
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
