import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

const foreignKeys = {
  image: new TableForeignKey({
    columnNames: ['image'],
    referencedTableName: 'image',
    referencedColumnNames: ['id'],
  }),
  image_reference: new TableForeignKey({
    columnNames: ['image_reference'],
    referencedTableName: 'image',
    referencedColumnNames: ['id'],
  }),
  product_categories: new TableForeignKey({
    columnNames: ['product_categories'],
    referencedTableName: 'product_category',
    referencedColumnNames: ['id'],
  }),
  shopper: new TableForeignKey({
    columnNames: ['shopper'],
    referencedTableName: 'users',
    referencedColumnNames: ['id'],
  }),
  business: new TableForeignKey({
    columnNames: ['business'],
    referencedTableName: 'business',
    referencedColumnNames: ['id'],
  }),
  order_shopper: new TableForeignKey({
    columnNames: ['shopper'],
    referencedTableName: 'users',
    referencedColumnNames: ['id'],
  }),
  order_business: new TableForeignKey({
    columnNames: ['business'],
    referencedTableName: 'business',
    referencedColumnNames: ['id'],
  }),
  shopper_address: new TableForeignKey({
    columnNames: ['shopper_address'],
    referencedTableName: 'addresses',
    referencedColumnNames: ['id'],
  }),
  business_address: new TableForeignKey({
    columnNames: ['business_address'],
    referencedTableName: 'addresses',
    referencedColumnNames: ['id'],
  }),
  product: new TableForeignKey({
    columnNames: ['product'],
    referencedTableName: 'product',
    referencedColumnNames: ['id'],
  }),
  cart: new TableForeignKey({
    columnNames: ['cart'],
    referencedTableName: 'cart',
    referencedColumnNames: ['id'],
  }),
};

const {
  image,
  image_reference,
  product_categories,
  shopper,
  business,
  shopper_address,
  business_address,
  product,
  cart,
  order_shopper,
  order_business,
} = foreignKeys;

export class addForeignKeysToMultipleTable1660231132647 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKeys('cart_product', [product, cart]);
    await queryRunner.createForeignKeys('cart', [shopper, business]);
    await queryRunner.createForeignKeys('order', [order_shopper, order_business, shopper_address, business_address]);
    await queryRunner.createForeignKeys('product', [image_reference, product_categories]);
    await queryRunner.createForeignKeys('product_category', [image]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys('cart_product', [product, cart]);
    await queryRunner.dropForeignKeys('cart', [shopper, business]);
    await queryRunner.dropForeignKeys('order', [shopper, business, shopper_address, business_address]);
    await queryRunner.dropForeignKeys('product', [image_reference, product_categories]);
    await queryRunner.dropForeignKeys('product_category', [image]);
  }
}
