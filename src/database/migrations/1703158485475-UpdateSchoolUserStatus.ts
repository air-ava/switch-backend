import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSchoolUserStatus1703158485475 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .update('users')
      .set({ status: 6 })
      .where('user_type = :type', { type: 'school' })
      .andWhere('email_verified_at IS NOT NULL')
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Implement the reverse operation if applicable
  }
}
