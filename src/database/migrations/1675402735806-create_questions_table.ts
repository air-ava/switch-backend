import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createQuestionsTable1675402735806 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'questions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'question',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'title_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['text', 'radio', 'checkbox'],
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
            isNullable: false,
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
    await queryRunner.dropTable('questions');
  }
}
