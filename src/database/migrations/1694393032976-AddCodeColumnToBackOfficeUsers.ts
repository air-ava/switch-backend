/* eslint-disable no-restricted-syntax */
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
import ModelRepo from '../repositories/index.repo';
import BackOfficeUsersRepo from '../repositories/backOfficeUser.repo';
import { v4 } from 'uuid';
import { STATUSES } from '../models/status.model';

export class AddCodeColumnToBackOfficeUsers1694393032976 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the 'code' column to the 'backOfficeUsers' table
    await queryRunner.addColumn(
      'backOfficeUsers',
      new TableColumn({
        name: 'code',
        type: 'varchar',
        length: '21',
        isNullable: false,
      }),
    );

    // Fetch all backOfficeUsers
    const backOfficeUsers = await BackOfficeUsersRepo.listBackOfficeUsers({ status: STATUSES.ACTIVE }, []);

    // Update the 'code' column with the desired value for each user
    await Promise.all(
      backOfficeUsers.map((user) => BackOfficeUsersRepo.updateBackOfficeUser(user.id, { code: `bou_${v4().replace(/-/g, '').substring(0, 17)}` })),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the 'code' column from the 'backOfficeUsers' table
    await queryRunner.dropColumn('backOfficeUsers', 'code');
  }
}
