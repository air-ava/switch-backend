import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createSchoolProductTable1685070376047 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'school_product',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'feature_name',
            type: 'varchar',
          },
          {
            name: 'payment_type_id',
            type: 'int',
          },
          {
            name: 'description',
            type: 'varchar',
          },
          {
            name: 'image',
            type: 'int',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
          },
          {
            name: 'school_class_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'school_id',
            type: 'int',
          },
          {
            name: 'status',
            type: 'int',
          },
          {
            name: 'period',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'session',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'code',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('school_product');
  }
}
