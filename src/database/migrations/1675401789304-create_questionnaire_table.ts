import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createQuestionnaireTable1675401789304 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'questionnaire',
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
            type: 'int',
            isNullable: false,
          },
          {
            name: 'answer_text',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'answer_boolean',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'title_id',
            type: 'int',
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
    await queryRunner.dropTable('questionnaire');
  }
}
