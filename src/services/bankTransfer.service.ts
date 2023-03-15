import { STATUSES } from '../database/models/status.model';
import { sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { Sanitizer } from '../utils/sanitizer';

const Service = {
  // todo: save Transaction with a channel of 'bank-transfer' and status of 'processing'
  // todo: save bank as 'beneficiary' if not going to owner accounts
  // todo: save internal Notes and Documents to Transactions
  // todo: before initiating transaction confirm if pin exists and ask for pin
  // todo: debit Wallet to initiate Transaction
  // async recordBankTransfer(data: any): Promise<theResponse> {
  //   const { user, school, defaultBank = false, country = 'UGANDA', number, account_name, bank_name, bank_code = null, bank_routing_number } = data;
  //   const wallet = await WalletREPO.findWallet({ userId: user.id, entity: 'school', entity_id: school.id, type: 'permanent' }, ['id', 'currency']);
  //   if (!wallet) {
  //     return {
  //       success: false,
  //       error: 'Wallet does not exist',
  //     };
  //   }
  //   const coreBankDetails = { walletId: wallet.id, currency: wallet.currency };
  //   const defaultBankDetails = { ...coreBankDetails, number, bank_name, status: STATUSES.ACTIVE };
  //   const foundBank = await BankRepo.findBank(defaultBankDetails, []);
  //   if (foundBank) return { success: false, error: 'Bank exists' };
  //   if (defaultBank) {
  //     const foundDefaultBank = await BankRepo.findDefaultBank(coreBankDetails, []);
  //     if (foundDefaultBank) return { success: false, error: 'Another bank is defaulted' };
  //   }
  //   const response = await BankRepo.saveBank({
  //     ...defaultBankDetails,
  //     bank_routing_number,
  //     default: defaultBank,
  //     country,
  //   });
  //   return sendObjectResponse('Banks retrieved successfully', Sanitizer.sanitizeBank(response));
  // },
  // todo: Update Status of Bank transfer
  // todo: Complete Bank transfer which update transaction status to 'success' and bank transfer status to 'approved'
  // todo: Complete Bank transfer which update transaction status to 'failed' and bank transfer status to 'declined'
  // todo: on Decline Reverse amount back to wallet
  // todo: Write a Cron to trigger a reminder of a pending transaction
};
export default Service;
