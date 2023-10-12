import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGenderAndRelationshipToPaymentContacts1697133131844 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('payment_contacts', [
      new TableColumn({
        name: 'gender',
        type: 'varchar',
        length: '255',
        isNullable: true, // Optional based on your requirement
      }),
      new TableColumn({
        name: 'relationship',
        type: 'varchar',
        length: '255',
        isNullable: true, // Optional based on your requirement
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('payment_contacts', 'gender');
    await queryRunner.dropColumn('payment_contacts', 'relationship');
  }
}
