import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateLoanTable1693290627154 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'loans',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'code',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'initiatorType',
            type: 'int',
            isNullable: false,
            default: `"school"`,
          },
          {
            name: 'initiator',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'completion_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'approval_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'schedule_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'int',
            isNullable: false,
            default: 1,
          },
          {
            name: 'productId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'score',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'debtServiceRatio',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'currency',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'requestAmount',
            type: 'decimal',
            default: 0,
            unsigned: true,
            precision: 20,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'approvedAmount',
            type: 'decimal',
            default: 0,
            unsigned: true,
            precision: 20,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'purpose',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'interest',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'amount_paid',
            type: 'decimal',
            default: 0,
            unsigned: true,
            precision: 20,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'isPropertyCollaterized',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'collateralReference',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'documentReference',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'penaltyStatus',
            type: 'int',
            isNullable: false,
            default: 1,
          },
          {
            name: 'penalty_amount',
            type: 'decimal',
            default: 0,
            unsigned: true,
            precision: 20,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'penalty_amount_paid',
            type: 'decimal',
            default: 0,
            unsigned: true,
            precision: 20,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'gracePeriodStatus',
            type: 'int',
            isNullable: false,
            default: 1,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('loans');
  }
}
