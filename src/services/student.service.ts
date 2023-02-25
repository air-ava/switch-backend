import { v4 } from 'uuid';
import { STATUSES } from '../database/models/status.model';
import { listClassLevel } from '../database/repositories/classLevel.repo';
import { saveMobileMoneyTransaction } from '../database/repositories/mobileMoneyTransactions.repo';
import { saveTransaction } from '../database/repositories/transaction.repo';
import { initiateCollection } from '../integrations/bayonic/collection.integration';
import { sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';

const Service = {
  // async addStudentToSchool(payload: any) {
  //   const { amount, user, student, phoneNumber, school, requestStatus } = payload;
  //   let { purpose } = payload;
  //   const { success: getWallet, data: wallet, error: walletError } = await WalletService.getSchoolWallet({ user });
  //   if (!getWallet) throw walletError;

  //   const reference = v4();
  //   const { success, data, error } = await initiateCollection({
  //     phonenumber: phoneNumber,
  //     first_name: student.first_name,
  //     last_name: student.last_name,
  //     amount,
  //     currency: 'BXC' || wallet.currency,
  //     metadata: {
  //       // eslint-disable-next-line prettier/prettier
  //       "wallet_username": wallet.uniquePaymentId,
  //       tx_reference: reference,
  //     },
  //     reason: `${purpose} for ${school.name}`,
  //     send_instructions: true,
  //     success_message: `${purpose} for ${student.first_name} ${student.last_name} at ${school.name} Successfully Paid`,
  //   });
  //   if (!success) {
  //     console.log({ error });
  //     throw new Error(error || 'collection request failed');
  //   }

  //   if (purpose === 'School-Fees') purpose = 'Payment:School-Fees';
  //   await saveTransaction({
  //     walletId: wallet.id,
  //     userId: user.id,
  //     amount,
  //     balance_after: Number(wallet.balance) + Number(amount),
  //     balance_before: Number(wallet.balance),
  //     purpose,
  //     metadata: {
  //       collectRequestId: data.id,
  //       fundersPhone: data.phonenumber,
  //       fundersNetwork: data.contact.network_name,
  //     },
  //     reference,
  //     status: STATUSES.PROCESSING,
  //     description: data.reason,
  //     txn_type: 'credit',
  //   });
  //   await saveMobileMoneyTransaction({
  //     tx_reference: reference,
  //     status: requestStatus,
  //     processor_transaction_id: data.id,
  //   });

  //   return {
  //     success: true,
  //     data,
  //   };
  // },

  async listClassLevels(): Promise<theResponse> {
    const response = await listClassLevel({}, []);
    return sendObjectResponse('Classes retrieved successfully', response);
  },
};

export default Service;
