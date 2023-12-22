import randomstring from 'randomstring';
import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';
import { WEMA_ACCOUNT_PREFIX } from '../../utils/secrets';

export class PopulateReservedAccounts1702688808461 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const studentsWithWallets = await queryRunner.manager
      .createQueryBuilder()
      .select('student.id', 'studentId')
      .addSelect('wallet.id', 'walletId')
      .addSelect("CONCAT(user.first_name, ' ', user.last_name)", 'userName')
      .addSelect('school.name', 'schoolName')
      .from('Student', 'student')
      .leftJoin('student.User', 'user')
      .leftJoin('student.School', 'school')
      .leftJoin('Wallets', 'wallet', "wallet.entity = 'school' AND wallet.entity_id = school.id")
      .where('wallet.entity = :entity', { entity: 'school' })
      .andWhere('wallet.currency = :currency', { currency: 'NGN' })
      .getRawMany();

    // eslint-disable-next-line no-restricted-syntax
    for (const student of studentsWithWallets) {
      const reservedAccountNumber = `${WEMA_ACCOUNT_PREFIX}${randomstring.generate({ length: 7, charset: 'numeric' })}`;

      // eslint-disable-next-line no-await-in-loop
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('ReservedAccount')
        .values({
          reserved_account_number: reservedAccountNumber,
          entity: 'student',
          entity_id: student.studentId,
          wallet_id: student.walletId,
          reserved_account_name: `${student.userName}/${student.schoolName}`,
          reserved_bank_code: '000017',
          created_at: new Date(),
        })
        .execute();
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverting logic (if applicable)
  }
}
