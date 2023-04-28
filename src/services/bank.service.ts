import { STATUSES } from '../database/models/status.model';
import BankRepo from '../database/repositories/bank.repo';
import BackOfficeBanksRepo from '../database/repositories/backOfficeBank.repo';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import { BadRequestException, ResourceNotFoundError, sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { Sanitizer } from '../utils/sanitizer';
import { listBanks } from '../integrations/bayonic/collection.integration';
import { bankListValidator } from '../validators/banks.validator';

const Service = {
  async listBanks(data: any): Promise<theResponse> {
    const { user, school } = data;
    const wallet = await WalletREPO.findWallet({ userId: user.id, entity: 'school', entity_id: school.id, type: 'permanent' }, ['id', 'currency']);
    if (!wallet) {
      return {
        success: false,
        error: 'Wallet does not exist',
      };
    }
    const response = await BankRepo.findBanks({ walletId: wallet.id, currency: wallet.currency, status: STATUSES.ACTIVE }, []);
    return sendObjectResponse('Banks retrieved successfully', Sanitizer.sanitizeAllArray(response, Sanitizer.sanitizeBank));
  },

  async listBanksBackOffice(): Promise<theResponse> {
    const response = await BackOfficeBanksRepo.findBackOfficeBanks({ status: STATUSES.ACTIVE }, []);
    return sendObjectResponse('Banks retrieved successfully', Sanitizer.sanitizeAllArray(response, Sanitizer.sanitizeBank));
  },

  async bankList(country: string): Promise<theResponse> {
    const validation = bankListValidator.validate(country);
    if (validation.error) return ResourceNotFoundError(validation.error);

    const banks = await listBanks();
    const ugandanBanks = banks.data.results.filter(({ country: { name } }: { country: { name: string } }) => name === `${country}`);
    return sendObjectResponse('Bank names retrieved successfully', Sanitizer.sanitizeAllArray(ugandanBanks, Sanitizer.sanitizeBankName));
  },

  async creatBank(data: any): Promise<theResponse> {
    const { user, school, defaultBank = false, country = 'UGANDA', number, account_name, bank_name, bank_code = null, bank_routing_number } = data;
    const wallet = await WalletREPO.findWallet({ userId: user.id, entity: 'school', entity_id: school.id, type: 'permanent' }, ['id', 'currency']);
    if (!wallet) {
      return {
        success: false,
        error: 'Wallet does not exist',
      };
    }
    const coreBankDetails = { walletId: wallet.id, currency: wallet.currency };

    const bankList = await BankRepo.findBanks({ ...coreBankDetails, status: STATUSES.ACTIVE }, []);
    if (bankList.length > 4) return { success: false, error: 'You can not add more than five(5) bank accounts' };

    const defaultBankDetails = { ...coreBankDetails, number, bank_name, bank_code, account_name, status: STATUSES.ACTIVE };

    const foundBank = await BankRepo.findBank(defaultBankDetails, []);
    if (foundBank) return { success: false, error: 'Bank exists' };

    if (defaultBank) {
      const foundDefaultBank = await BankRepo.findDefaultBank(coreBankDetails, []);
      if (foundDefaultBank) return { success: false, error: 'Another bank is defaulted' };
    }

    const response = await BankRepo.saveBank({
      ...defaultBankDetails,
      bank_routing_number,
      default: defaultBank,
      country,
    });
    return sendObjectResponse('Banks retrieved successfully', Sanitizer.sanitizeBank(response));
  },

  async defaultBank(data: any): Promise<theResponse> {
    const { id, defaultBank = 'true', user, school } = data;

    // getWallet
    const wallet = await WalletREPO.findWallet({ userId: user.id, entity: 'school', entity_id: school.id, type: 'permanent' }, ['id', 'currency']);
    if (!wallet) return { success: false, error: 'Wallet does not exist' };

    // check if defaulted bank exist
    const foundBank = await BankRepo.findBank({ id }, []);
    if (!foundBank) return { success: false, error: 'Bank not found' };

    const existingDefaultedBank = await BankRepo.findDefaultBank({ walletId: wallet.id, currency: wallet.currency }, []);
    if (existingDefaultedBank && defaultBank === 'true') {
      if (existingDefaultedBank.id === foundBank.id) return { success: false, error: 'This bank is defaulted already' };
      const defaultedBanks = await BankRepo.findBanks({ walletId: wallet.id, currency: wallet.currency, status: STATUSES.ACTIVE, default: true }, []);
      if (defaultedBanks.length === 1) {
        const [currentlyDefaulted] = defaultedBanks;
        await BankRepo.unDefaultBank({ id: currentlyDefaulted.id });
      } else return { success: false, error: 'Another bank is defaulted' };
    }

    // if (defaultBank !== 'true') {
    //   const defaultedBanks = await BankRepo.findBanks({ walletId: wallet.id, currency: wallet.currency, status: STATUSES.ACTIVE, default: true }, []);
    //   if (defaultedBanks.length === 1) return { success: false, error: 'One bank must be active' };
    // }

    // eslint-disable-next-line no-unused-expressions
    defaultBank === 'true' ? await BankRepo.defaultBank({ id }) : await BankRepo.unDefaultBank({ id });
    return sendObjectResponse(`Bank ${defaultBank === 'true' ? 'defaulted' : 'un-defaulted'} successfully`);
  },

  async deleteBank(data: any): Promise<theResponse> {
    // const validation = verifyUserValidator.validate(data);
    // if (validation.error) return ResourceNotFoundError(validation.error);

    const { id } = data;
    try {
      const foundBank = await BankRepo.findBank({ id }, [], []);
      if (!foundBank) throw Error(`Bank not found`);

      await BankRepo.updateBank({ id }, { status: STATUSES.DELETED });

      return sendObjectResponse('Bank deleted Succefully');
    } catch (e: any) {
      console.log({ e });
      return BadRequestException(e.message);
    }
  },
};
export default Service;
