/* eslint-disable no-await-in-loop */
import randomstring from 'randomstring';
import { getSchool } from '../database/repositories/schools.repo';
import { getStudent } from '../database/repositories/student.repo';
import { assignAccountNumberDTO } from '../dto/reservedAccount.dto';
import { NotFoundError, sendObjectResponse } from '../utils/errors';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import ReservedAccountREPO from '../database/repositories/reservedAccount.repo';
import { theResponse } from '../utils/interface';
import { WEMA_ACCOUNT_PREFIX } from '../utils/secrets';

const Service = {
  generateRandomAccountNumber(): string {
    return `${WEMA_ACCOUNT_PREFIX}${randomstring.generate({ length: 7, charset: 'numeric' })}`;
  },

  async createUniqueAccountNumber(): Promise<string | undefined> {
    let uniqueFound = false;
    let accountNumber;

    while (!uniqueFound) {
      accountNumber = Service.generateRandomAccountNumber();
      uniqueFound = !(await ReservedAccountREPO.getReservedAccount({ reserved_account_number: accountNumber }, []));
    }

    return accountNumber;
  },

  async assignAccountNumber(data: assignAccountNumberDTO): Promise<theResponse> {
    const { holder, holderId, user, school } = data;
    let accountNumberHolder;
    let entity = 'student';
    let entity_id;
    // eslint-disable-next-line default-case
    switch (holder) {
      case 'student': {
        accountNumberHolder = await getStudent({ id: holderId }, [], ['User']);
        if (!accountNumberHolder) throw new NotFoundError(`Student`);

        entity_id = accountNumberHolder.id;
        accountNumberHolder = `${accountNumberHolder.User.first_name} ${accountNumberHolder.User.last_name}/${school.name}`;
        entity = 'student';

        break;
      }
      case 'school': {
        accountNumberHolder = await getSchool({ id: holderId }, []);
        if (!accountNumberHolder) throw new NotFoundError(`School`);

        entity_id = accountNumberHolder.id;
        accountNumberHolder = accountNumberHolder.name;
        entity = 'school';

        break;
      }
    }

    const wallet = await WalletREPO.findWallet({ userId: user.id, entity: 'school', entity_id: school.id, type: 'permanent' }, ['id', 'currency']);
    if (!wallet) throw new NotFoundError(`Wallet`);

    const reservedAccountNumber = Service.createUniqueAccountNumber();
    await ReservedAccountREPO.createReservedAccount({
      entity,
      entity_id,
      processor: 'WEMA',
      type: 'permanent',
      country: 'NIGERIA',
      wallet_id: wallet.id,
      reserved_bank_code: '000017',
      reserved_bank_name: 'Wema Bank',
      reserved_account_name: accountNumberHolder,
      reserved_account_number: reservedAccountNumber,
    });
    return sendObjectResponse(`Successfully processed request`);
  },
};

export default Service;
