import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateIsOwnerToIndividual1701730874401 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE individual 
            SET is_owner = true
            FROM (
                SELECT school_id, type, MIN(created_at) AS min_created_at
                FROM individual 
                WHERE type IN ('director', 'shareholder')
                GROUP BY school_id, type
            ) AS earliest_records 
            WHERE individual.school_id = earliest_records.school_id 
              AND individual.type = earliest_records.type 
              AND individual.created_at = earliest_records.min_created_at
              AND individual.is_owner = false
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE individual
            SET is_owner = false
            WHERE is_owner = true
        `);
  }
}
