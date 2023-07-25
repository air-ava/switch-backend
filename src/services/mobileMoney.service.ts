import { Preference } from './../database/models/preferences.model';
import { IStudentClass } from './../database/modelInterfaces';
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// creditWalletOnMobileMoney
// chargeWalletOnMobileMoney

import { v4 } from 'uuid';
import { Not, In } from 'typeorm';
import { getQueryRunner } from '../database/helpers/db';
import { STATUSES } from '../database/models/status.model';
import { saveMobileMoneyTransaction, updateMobileMoneyTransactionREPO } from '../database/repositories/mobileMoneyTransactions.repo';
import { getStudent } from '../database/repositories/student.repo';
import { getOneTransactionREPO, saveTransaction, updateTransactionREPO } from '../database/repositories/transaction.repo';
import { initiateCollection } from '../integrations/bayonic/collection.integration';
import { Service as WalletService } from './wallet.service';
import PreferenceService from './preference.service';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import { fetchUserBySlug, fetchUserProfile } from './user.service';
import { creditLedgerWallet, debitLedgerWallet } from './lien.service';
import { updateStatusOfALienTransaction } from '../database/repositories/lienTransaction.repo';
import { saveThirdPartyLogsREPO } from '../database/repositories/thirdParty.repo';
import { ENVIRONMENT, STEWARD_BASE_URL } from '../utils/secrets';
import Settings from './settings.service';
import Utils from '../utils/utils';
import { sendSms } from '../integrations/africasTalking/sms.integration';
import { sendEmail } from '../utils/mailtrap';
import FeesService from './fees.service';
import { findUser } from '../database/repositories/user.repo';
import { createPaymentContacts } from '../database/repositories/paymentContact.repo';

export const Service = {
  async initiateCollectionRequest(payload: any) {
    const { amountWithFees, amount, user, student, reciever, phoneNumber, school, studentTutition } = payload;

    let { purpose } = payload;
    const reference = v4();
    const metadata: any = {
      amountWithFees,
      amount,
      charges: amountWithFees - amount,
      tx_reference: reference,
      transaction_type: purpose,
    };

    if (purpose === 'school-fees') {
      metadata.username = student.uniqueStudentId;
      purpose = 'Payment:School-Fees';
    }
    if (purpose === 'top-up') {
      metadata.username = reciever.uniquePaymentId;
      purpose = 'Funding:Wallet-Top-Up';
    }
    const { success: getWallet, data: wallet, error: walletError } = await WalletService.getSchoolWallet({ user });
    if (!getWallet) throw walletError;

    const initiator = student.User || reciever;
    const { success, data, error } = await initiateCollection({
      phonenumber: phoneNumber,
      first_name: initiator.first_name,
      last_name: initiator.last_name,
      // amount: amount / 100,
      amount: amountWithFees / 100,
      currency: Utils.isStaging() ? 'BXC' : wallet.currency,
      metadata,
      reason: `${purpose}`,
      send_instructions: true,
      success_message: `${purpose} for ${initiator.first_name} ${initiator.last_name} at ${school.name} Successfully Paid`,
    });
    if (!success) {
      console.log({ error });
      throw new Error(error || 'collection request failed');
    }
    const description = `${purpose} for ${initiator.first_name} ${initiator.last_name} at ${school.name}`;
    const { contact, id: collectRequestId, status } = data;
    if (purpose === 'Payment:School-Fees') metadata.studentTutition = studentTutition;
    // create contact for the payer
    const paymentContact = await createPaymentContacts({
      school: school.id,
      phone_number: phoneNumber,
      status: STATUSES.ACTIVE,
    });

    await saveMobileMoneyTransaction({
      tx_reference: reference,
      status: Service.getBayonicStatus(status),
      processor_transaction_id: collectRequestId,
    });
    await saveTransaction({
      walletId: wallet.id,
      userId: user.id,
      // amount,
      amount: amountWithFees,
      // balance_after: Number(wallet.balance) + Number(amount),
      balance_after: Number(wallet.balance) + Number(amountWithFees),
      balance_before: Number(wallet.balance),
      purpose,
      metadata: {
        ...metadata,
        collectRequestId,
        fundersPhone: data.phonenumber,
        fundersNetwork: contact.network_name,
        paymentContact,
      },
      reference,
      status: STATUSES.PROCESSING,
      description,
      txn_type: 'credit',
    });
    await creditLedgerWallet({
      // amount: Number(amount),
      amount: Number(amountWithFees),
      user,
      walletId: wallet.id,
      reference,
      description,
      metadata: {
        ...metadata,
        purpose,
        collectRequestId,
        fundersPhone: data.phonenumber,
        fundersNetwork: contact.network_name,
      },
      saveToTransaction: false,
    });

    return {
      success: true,
      data,
    };
  },

  getBayonicStatus(incomingStatus: string) {
    const bayonicStatus: any = {
      processing_started: STATUSES.INITIATED,
      pending: STATUSES.PENDING,
      successful: STATUSES.SUCCESS,
      failed: STATUSES.FAILED,
      instructions_sent: STATUSES.PROCESSING,
      new: STATUSES.NEW,
    };
    return bayonicStatus[incomingStatus];
  },

  // check transactionType
  // If It is "top-up": Find Wallet
  // If It is "school-fees": Find Student using Username
  // return "user", "wallet", "school", "purpose"
  async generateMobileMoneyData(payload: any) {
    const { metadata, status, id: requestId, phonenumber, contact } = payload;
    const { username, tx_reference: reference, transaction_type } = metadata;

    metadata.collectRequestId = requestId;
    metadata.fundersPhone = phonenumber;
    metadata.fundersNetwork = contact.network_name;

    let student: any;
    let purpose = 'Funding:Wallet-Top-Up';
    let returnData: any;
    if (transaction_type === 'school-fees') {
      purpose = 'Payment:School-Fees';
      student = await getStudent({ uniqueStudentId: username }, [], ['User', 'School', 'Classes', 'Classes.ClassLevel']);
      const { Classes, School, User, ...rest } = student;
      const studentCurrentClass = Classes.filter((value: IStudentClass) => value.status === STATUSES.ACTIVE);
      returnData = { student: { ...rest }, school: School, user: User, classes: studentCurrentClass };
    }

    if (transaction_type === 'top-up') {
      purpose = 'Funding:Wallet-Top-Up';
      returnData = { uniquePaymentId: username };
    }

    return { success: true, data: { ...returnData, metadata, purpose, reference, requestId, status: Service.getBayonicStatus(status) } };
  },

  // create MobileMoney details for the collection Contact to know where the money goes to
  async updateMobileMoneyTransactions(payload: any) {
    const { reference, status, requestId, school, incomingData, incomingStatus, metadata } = payload.data;
    await updateMobileMoneyTransactionREPO(
      {
        tx_reference: reference,
        processor_transaction_id: requestId,
      },
      { status },
    );

    if (status === STATUSES.FAILED) await updateTransactionREPO({ reference, txn_type: 'credit', channel: 'mobile-money' }, { status, metadata });

    await saveThirdPartyLogsREPO({
      event: 'collectionrequest.status.changed',
      message: `Mobile-Money-Collection-Request:${incomingStatus}`,
      endpoint: `${STEWARD_BASE_URL}/webhook/beyonic`,
      school: school.id,
      endpoint_verb: 'POST',
      status_code: '200',
      payload: JSON.stringify(incomingData),
      provider_type: 'payment-provider',
      provider: 'BEYONIC',
      reference,
    });

    console.log('saveMobileMoneyTransaction');
    return { success: true };
  },

  // Completes A Mobile Money Transaction
  async completeTransaction(payload: any) {
    const { reference, purpose, metadata, status } = payload;
    // const t = await getQueryRunner();
    try {
      const {
        Wallet: wallet,
        User: user,
        description,
        amount,
        currency,
        metadata: transactionMetadata,
        created_at,
      } = await getOneTransactionREPO({ reference, txn_type: 'credit', channel: 'mobile-money' }, [], ['User', 'Wallet', 'Reciepts']);
      await debitLedgerWallet({
        amount,
        user,
        walletId: wallet.id,
        reference,
        metadata,
        // t,
      });
      await WalletService.creditWallet({
        amount,
        user,
        wallet_id: wallet.id,
        purpose,
        description: 'Completing Mobile Money Funding',
        metadata,
        reference,
        noTransaction: true,
        // t,
      });
      metadata.completed_at = new Date(Date.now());
      await updateTransactionREPO({ reference, txn_type: 'credit', channel: 'mobile-money' }, { status, metadata });
      await updateStatusOfALienTransaction(
        { reference, status: STATUSES.COMPLETED },
        // t
      );
      // loggerInfo = 'Lien Merhcant settlement complete';

      const {
        success: debitSuccess,
        data: transactionFees,
        error: debitError,
      } = await WalletService.debitTransactionFees({
        wallet_id: wallet.id,
        reference,
        user,
        description,
        feesNames: ['mobile-money-subscription-school-fees', 'steward-charge-school-fees', 'mobile-money-collection-fees'],
        transactionAmount: transactionMetadata.amount ? transactionMetadata.amount : amount,
      });

      const feesConfig = Settings.get('TRANSACTION_FEES');
      const feesPurposeNames: string[] = [
        feesConfig['mobile-money-subscription-school-fees'].purpose,
        feesConfig['steward-charge-school-fees'].purpose,
        feesConfig['mobile-money-collection-fees'].purpose,
      ];
      await updateTransactionREPO(
        { reference, purpose: Not(In(purpose)) },
        {
          metadata: {
            ...transactionMetadata,
            transactionFees,
            fees: feesPurposeNames,
          },
        },
        // t,
      );

      // todo: record Transaction for a Tuition Fee
      // studentTutition
      // Top Up Beneficiary Payment Like debitLedgerWallet
      if (transactionMetadata.studentTutition) {
        const { amount: reccordAmount, studentTutition, paymentContact, ...rest } = transactionMetadata;
        const { id: beneficiaryId, Fee, beneficiary_type: beneficiaryType } = studentTutition;
        await FeesService.recordInstallment({
          amount: reccordAmount,
          reference,
          paymentContact,
          metadata: rest,
          beneficiaryId,
        });
      }

      // await t.commitTransaction();
      const { data } = await PreferenceService.getNotificationContacts(wallet.entity_id);
      const { emails, phoneNumbers, transactions: transactionNotification } = data;
      const { notifyInflow, notifyOutflow } = transactionNotification;
      if (notifyInflow.includes('phoneNumbers'))
        sendSms({
          phoneNumber: data.phoneNumbers,
          message: `amount: ${currency}${amount}\n
            method: mobile-money\n
            type: credit\n
            description: ${description}\n
            reference: ${reference}\n
            date: ${created_at}\n`,
        });
      // if (notifyInflow.includes('email')) {
      //   sendEmail({
      //     recipientEmail: emails,
      //     purpose: 'welcome_user',
      //     templateInfo: {
      //       firstName: ` ${user.first_name}`,
      //       reference,
      //       description,
      //       date: created_at,
      //       amount: `${currency}${amount}`,
      //       type: 'credit',
      //       method: 'mobile-money',
      //     },
      //   });
      // }
    } catch (error) {
      console.log({ error });
      // await t.rollbackTransaction();
    } finally {
      // await t.release();
    }
  },

  // async bayonicCollectionVerification() {},
};

export async function bayonicCollectionHandler(payload: any): Promise<any> {
  const { status: incomingStatus } = payload;
  const txData = await Service.generateMobileMoneyData(payload);

  txData.data.incomingData = payload;
  txData.data.incomingStatus = incomingStatus;

  switch (incomingStatus) {
    case 'processing_started':
      await Service.updateMobileMoneyTransactions(txData);
      break;
    case 'pending':
      await Service.updateMobileMoneyTransactions(txData);
      break;
    case 'successful':
      await Service.updateMobileMoneyTransactions(txData);
      break;
    case 'failed':
      await Service.updateMobileMoneyTransactions(txData);
      break;
    case 'instructions_sent':
      await Service.updateMobileMoneyTransactions(txData);
      break;
    default:
      break;
  }
}

export default Service;
