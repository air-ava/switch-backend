import randomstring from 'randomstring';
import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';
import { WEMA_ACCOUNT_PREFIX } from '../../utils/secrets';

export class PopulateReservedAccountsForSchools1703069359372 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schoolsWithWallets = await queryRunner.manager
      .createQueryBuilder()
      .select('school.id', 'entity_id')
      .addSelect('wallet.id', 'wallet_id')
      .addSelect('school.name', 'reserved_account_name')
      .from('Schools', 'school')
      .leftJoin('Wallets', 'wallet', "wallet.entity = 'school' AND wallet.entity_id = school.id")
      .where('wallet.entity = :entity', { entity: 'school' })
      .andWhere('wallet.currency = :currency', { currency: 'NGN' })
      .getRawMany();

    // eslint-disable-next-line no-restricted-syntax
    for (const school of schoolsWithWallets) {
      const reservedAccountNumber = `${WEMA_ACCOUNT_PREFIX}${randomstring.generate({ length: 7, charset: 'numeric' })}`;

      console.log({ school });
      // eslint-disable-next-line no-await-in-loop
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('ReservedAccount')
        .values({
          reserved_account_number: reservedAccountNumber,
          entity: 'school',
          entity_id: school.entity_id,
          wallet_id: school.wallet_id,
          reserved_account_name: school.reserved_account_name,
          reserved_bank_code: '000017',
          // Set other fields as required
        })
        .execute();
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert logic, if applicable
  }
}
