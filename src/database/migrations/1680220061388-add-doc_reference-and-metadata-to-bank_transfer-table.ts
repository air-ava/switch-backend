import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const tableData = {
  reference: new TableColumn({
    name: 'document_reference',
    type: 'varchar',
    isNullable: true,
  }),
  metadata: new TableColumn({
    name: 'metadata',
    type: 'json',
    isNullable: true,
  }),
};

const { reference, metadata } = tableData;

export class addDocReferenceAndMetadataToBankTransferTable1680220061388 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('bankTransfers', [reference, metadata]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('bankTransfers', [reference, metadata]);
  }
}
