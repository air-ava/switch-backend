/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// creditWalletOnMobileMoney
// chargeWalletOnMobileMoney

import { v4 } from 'uuid';
import { getQueryRunner } from '../database/helpers/db';
import { STATUSES } from '../database/models/status.model';
import { saveMobileMoneyTransaction } from '../database/repositories/mobileMoneyTransactions.repo';
import { getOneTransactionREPO, saveTransaction, updateTransactionREPO } from '../database/repositories/transaction.repo';
import { initiateCollection } from '../integrations/bayonic/collection.integration';
import { Service as WalletService } from './wallet.service';

export const Service = {
  async bayonicCollectionRequest(payload: any) {
    const { amount, user, student, phoneNumber, school, requestStatus } = payload;
    let { purpose } = payload;
    const { success: getWallet, data: wallet, error: walletError } = await WalletService.getSchoolWallet({ user });
    if (!getWallet) throw walletError;

    const reference = v4();
    const { success, data, error } = await initiateCollection({
      phonenumber: phoneNumber,
      first_name: student.first_name,
      last_name: student.last_name,
      amount,
      currency: 'BXC' || wallet.currency,
      metadata: {
        // eslint-disable-next-line prettier/prettier
        "wallet_username": wallet.uniquePaymentId,
        tx_reference: reference,
      },
      reason: `${purpose} for ${school.name}`,
      send_instructions: true,
      success_message: `${purpose} for ${student.first_name} ${student.last_name} at ${school.name} Successfully Paid`,
    });
    if (!success) {
      console.log({ error });
      throw new Error(error || 'collection request failed');
    }

    if (purpose === 'School-Fees') purpose = 'Payment:School-Fees';
    await saveTransaction({
      walletId: wallet.id,
      userId: user.id,
      amount,
      balance_after: Number(wallet.balance) + Number(amount),
      balance_before: Number(wallet.balance),
      purpose,
      metadata: {
        collectRequestId: data.id,
        fundersPhone: data.phonenumber,
        fundersNetwork: data.contact.network_name,
      },
      reference,
      status: STATUSES.PROCESSING,
      description: data.reason,
      txn_type: 'credit',
    });
    await saveMobileMoneyTransaction({
      tx_reference: reference,
      status: requestStatus,
      processor_transaction_id: data.id,
    });

    return {
      success: true,
      data,
    };
  },

  async generateMobileMoneyData(payload: any) {
    // check transactionType
    // If It is "top-up": Find Wallet
    // If It is "school-fees": Find Student using Username
    // return "user", "wallet", "school", "purpose"
    const { reference, status, requestId } = payload;
    await saveMobileMoneyTransaction({
      tx_reference: reference,
      status,
      processor_transaction_id: requestId,
    });

    return {
      success: true,
      // data,
    };
  },

  // create MobileMoney details for the collection Contact to know where the money goes to

  async updateMobileMoneyTransactions(payload: any) {
    const { reference, status, requestId } = payload;
    await saveMobileMoneyTransaction({
      tx_reference: reference,
      status,
      processor_transaction_id: requestId,
    });

    if (status === STATUSES.PENDING || status === STATUSES.SUCCESS || status === STATUSES.FAILED) {
      await updateTransactionREPO({ reference, txn_type: 'credit', channel: 'mobile-money' }, { status });
      if (status === STATUSES.SUCCESS) {
        const t = await getQueryRunner();
        try {
          const {
            Wallet: wallet,
            User: user,
            description,
            amount,
          } = await getOneTransactionREPO({ reference, txn_type: 'credit', channel: 'mobile-money' }, [], ['User', 'Wallet', 'Reciepts']);

          await WalletService.debitTransactionFees({
            wallet_id: wallet.id,
            reference,
            user,
            description,
            feesNames: ['debit-fees'],
            transactionAmount: amount,
          });
          await t.commitTransaction();
        } catch (error) {
          console.log({ error });
          await t.rollbackTransaction();
        } finally {
          await t.release();
        }
      }
    }

    return {
      success: true,
      // data,
    };
  },

  // Connect this to the bayonic Webhook
  // async bayonicCollectionVerification() {},
};

export async function bayonicCollectionHandler(payload: any): Promise<any> {
  const { status: incomingStatus } = payload;
  const bayonicStatus: any = {
    processing_started: STATUSES.INITIATED,
    pending: STATUSES.PENDING,
    successful: STATUSES.SUCCESS,
    failed: STATUSES.FAILED,
    instructions_sent: STATUSES.PROCESSING,
  };
  switch (incomingStatus) {
    case 'processing_started':
      await Service.bayonicCollectionRequest(payload);
      break;
    case 'pending':
      await Service.updateMobileMoneyTransactions(payload);
      break;
    case 'successful':
      await Service.updateMobileMoneyTransactions(payload.data);
      break;
    case 'failed':
      await Service.updateMobileMoneyTransactions(payload.data);
      break;
    case 'instructions_sent':
      await Service.updateMobileMoneyTransactions(payload.data);
      break;
    default:
      break;
  }
}
