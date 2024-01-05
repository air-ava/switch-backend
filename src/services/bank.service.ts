import { STATUSES } from '../database/models/status.model';
import BankAccountRepo from '../database/repositories/bankAccount.repo';
import BankRepo from '../database/repositories/banks.repo';
import BackOfficeBanksRepo from '../database/repositories/backOfficeBank.repo';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import { BadRequestException, ResourceNotFoundError, catchIntegrationWithThirdPartyLogs, sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { Sanitizer } from '../utils/sanitizer';
import { listBanks } from '../integrations/bayonic/collection.integration';
import { bankListValidator } from '../validators/banks.validator';
import { getBankList } from '../integrations/wema/banks';

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
    const response = await BankAccountRepo.findBanks({ walletId: wallet.id, currency: wallet.currency, status: STATUSES.ACTIVE }, []);
    return sendObjectResponse('Banks retrieved successfully', Sanitizer.sanitizeAllArray(response, Sanitizer.sanitizeBankAccount));
  },

  async listBanksBackOffice(): Promise<theResponse> {
    const response = await BackOfficeBanksRepo.findBackOfficeBanks({ status: STATUSES.ACTIVE }, []);
    return sendObjectResponse('Banks retrieved successfully', Sanitizer.sanitizeAllArray(response, Sanitizer.sanitizeBankAccount));
  },

  async bankList(country: string): Promise<theResponse> {
    let foundBanks: any;
    if (country === 'UGANDA') {
      const banks = await listBanks();
      foundBanks = banks.data.results.filter(({ country: { name } }: { country: { name: string } }) => name === `${country}`);
      foundBanks = Sanitizer.sanitizeAllArray(foundBanks, Sanitizer.sanitizeBankName);
    }

    if (country === 'NIGERIA') {
      foundBanks = await BankRepo.listBanks({ country: 'NIGERIA' }, []);
      // foundBanks = await getBankList();
      foundBanks = Sanitizer.sanitizeAllArray(foundBanks, Sanitizer.sanitizeBank);
    }

    return sendObjectResponse('Bank names retrieved successfully', foundBanks);
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

    const bankList = await BankAccountRepo.findBanks({ ...coreBankDetails, status: STATUSES.ACTIVE }, []);
    if (bankList.length > 4) return { success: false, error: 'You can not add more than five(5) bank accounts' };

    const defaultBankDetails = { ...coreBankDetails, number, bank_name, bank_code, account_name, status: STATUSES.ACTIVE };

    const foundBank = await BankAccountRepo.findBank(defaultBankDetails, []);
    if (foundBank) return { success: false, error: 'Bank exists' };

    if (defaultBank) {
      const foundDefaultBank = await BankAccountRepo.findDefaultBank(coreBankDetails, []);
      if (foundDefaultBank) return { success: false, error: 'Another bank is defaulted' };
    }

    const response = await BankAccountRepo.saveBank({
      ...defaultBankDetails,
      bank_routing_number,
      default: defaultBank,
      country,
    });
    return sendObjectResponse('Banks retrieved successfully', Sanitizer.sanitizeBankAccount(response));
  },

  async defaultBank(data: any): Promise<theResponse> {
    const { id, defaultBank = 'true', user, school } = data;

    // getWallet
    const wallet = await WalletREPO.findWallet({ userId: user.id, entity: 'school', entity_id: school.id, type: 'permanent' }, ['id', 'currency']);
    if (!wallet) return { success: false, error: 'Wallet does not exist' };

    // check if defaulted bank exist
    const foundBank = await BankAccountRepo.findBank({ id }, []);
    if (!foundBank) return { success: false, error: 'Bank not found' };

    const existingDefaultedBank = await BankAccountRepo.findDefaultBank({ walletId: wallet.id, currency: wallet.currency }, []);
    if (existingDefaultedBank && defaultBank === 'true') {
      if (existingDefaultedBank.id === foundBank.id) return { success: false, error: 'This bank is defaulted already' };
      const defaultedBanks = await BankAccountRepo.findBanks({ walletId: wallet.id, currency: wallet.currency, status: STATUSES.ACTIVE, default: true }, []);
      if (defaultedBanks.length === 1) {
        const [currentlyDefaulted] = defaultedBanks;
        await BankAccountRepo.unDefaultBank({ id: currentlyDefaulted.id });
      } else return { success: false, error: 'Another bank is defaulted' };
    }

    // if (defaultBank !== 'true') {
    //   const defaultedBanks = await BankAccountRepo.findBanks({ walletId: wallet.id, currency: wallet.currency, status: STATUSES.ACTIVE, default: true }, []);
    //   if (defaultedBanks.length === 1) return { success: false, error: 'One bank must be active' };
    // }

    // eslint-disable-next-line no-unused-expressions
    defaultBank === 'true' ? await BankAccountRepo.defaultBank({ id }) : await BankAccountRepo.unDefaultBank({ id });
    return sendObjectResponse(`Bank ${defaultBank === 'true' ? 'defaulted' : 'un-defaulted'} successfully`);
  },

  async deleteBank(data: any): Promise<theResponse> {
    // const validation = verifyUserValidator.validate(data);
    // if (validation.error) return ResourceNotFoundError(validation.error);

    const { id } = data;
    try {
      const foundBank = await BankAccountRepo.findBank({ id }, [], []);
      if (!foundBank) throw Error(`Bank not found`);

      await BankAccountRepo.updateBank({ id }, { status: STATUSES.DELETED });

      return sendObjectResponse('Bank deleted Succefully');
    } catch (e: any) {
      console.log({ e });
      return BadRequestException(e.message);
    }
  },
};
export default Service;
