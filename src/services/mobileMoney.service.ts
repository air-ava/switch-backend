/* eslint-disable consistent-return */
import { v4 } from 'uuid';
import { Not, In } from 'typeorm';
import { Preference } from '../database/models/preferences.model';
import { IStudentClass } from '../database/modelInterfaces';
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// creditWalletOnMobileMoney
// chargeWalletOnMobileMoney

import { getQueryRunner } from '../database/helpers/db';
import { STATUSES } from '../database/models/status.model';
import { saveMobileMoneyTransaction, updateMobileMoneyTransactionREPO } from '../database/repositories/mobileMoneyTransactions.repo';
import { getStudent } from '../database/repositories/student.repo';
import { getOneTransactionREPO, getTransactionsREPO, saveTransaction, updateTransactionREPO } from '../database/repositories/transaction.repo';
import { createPayment, initiateCollection } from '../integrations/bayonic/collection.integration';
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
import {
  createMobileMoneyPaymentREPO,
  getMobileMoneyPaymentREPO,
  updateMobileMoneyPaymentREPO,
} from '../database/repositories/mobileMoneyPayment.repo';
import { sendSlackMessage } from '../integrations/extra/slack.integration';
import { NotificationHandler } from './helper.service';
import { getSchool } from '../database/repositories/schools.repo';
import { mobileMoneyPaymentDTO } from '../dto/mobileMoney.dto';
import ValidationError from '../utils/validationError';

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

    // eslint-disable-next-line prettier/prettier
    const initiator = student ? (student.User || reciever) : reciever;
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

  async initiatePayment(payload: any) {
    const txPurpose = Settings.get('TRANSACTION_PURPOSE');
    const { amountWithFees, amount, user, student, network, network_name, method, reciever, phoneNumber, school, studentTutition, feesNames } =
      payload;

    let { purpose } = payload;
    const initiator = reciever;
    const reference = v4();
    const metadata: any = {
      amountWithFees,
      amount,
      charges: amountWithFees - amount,
      tx_reference: reference,
      transaction_type: purpose,
      school: school.code,
    };

    if (purpose === 'cash-out') {
      metadata.username = reciever.uniquePaymentId;
      purpose = txPurpose[purpose].purpose;
    }
    const description = `${purpose} from ${school.name} through ${method} to ${phoneNumber}`;

    const { success: getWallet, data: wallet, error: walletError } = await WalletService.getSchoolWallet({ user });
    if (!getWallet) throw walletError;

    await WalletService.debitWallet({
      reference,
      description,
      amount,
      purpose,
      user,
      status: STATUSES.PROCESSING,
      wallet_id: wallet.id,
    });

    const paymentContact = await createPaymentContacts({
      school: school.id,
      phone_number: phoneNumber,
      status: STATUSES.ACTIVE,
      metadata: { network },
    });

    // createMobileMoneyPaymentREPO

    const { success, data, error } = await createPayment({
      phonenumber: phoneNumber,
      amount: amount / 100,
      description,
      metadata,
    });

    if (!success) {
      console.log({ error });
      throw new Error(error || 'collection request failed');
    }

    const { contact, id: collectRequestId, state: status } = data;
    const { data: sortedData } = await Service.generateMobileMoneyPaymentData(data);
    await createMobileMoneyPaymentREPO({
      transaction_reference: reference,
      status: sortedData.status,
      processor_reference: sortedData.requestId,
      amount,
      narration: sortedData.narration,
      fee: sortedData.fee,
      metadata: { contact: data.phone_nos },
      purpose,
      reason: sortedData.reason,
      receiver: paymentContact.id,
      description: sortedData.description,
      processor: 'BEYONIC',
    });
    await updateTransactionREPO(
      { reference },
      {
        metadata: {
          collectRequestId,
          fundersPhone: data.phonenumber,
          fundersNetwork: network,
          paymentContact,
        },
      },
      // t,
    );

    // todo: soft debit transaction Fees
    // - record transaction as pending
    const {
      success: debitSuccess,
      data: transactionFees,
      error: debitError,
    } = await WalletService.debitTransactionFees({
      wallet_id: wallet.id,
      reference,
      user,
      description,
      feesNames,
      transactionAmount: amount,
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
      cancelled: STATUSES.CANCELLED,
      rejected: STATUSES.REJECTED,
      processed_with_errors: STATUSES.COMPLETED,
      scheduled: STATUSES.PROCESSING,
      processed: STATUSES.PROCESSED,
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

  async generateMobileMoneyPaymentData(payload: any) {
    const {
      charged_fee,
      payment_fx_details,
      state: status,
      id: requestId,
      phone_nos,
      transactions,
      account: accountId,
      amount,
      currency,
      payment_type: type,
      description,
      remote_transaction_id,
      ...rest
    } = payload;
    let { metadata } = payload;
    const [firstPhone] = phone_nos;
    const { school: schoolCode, username, tx_reference: reference, transaction_type } = metadata;

    const [beyonicTransaction] = transactions;
    const { id: transactionId, type: channel, fee_transaction } = beyonicTransaction || {};

    const feeAmount = fee_transaction ? Math.abs(parseFloat(fee_transaction.amount)) : 0;

    metadata = { schoolCode };
    metadata.collectRequestId = requestId;
    metadata.contacts = phone_nos;
    metadata.fundersPhone = firstPhone?.phonenumber;
    metadata.charged_fee = charged_fee && charged_fee;
    metadata.payment_fx_details = payment_fx_details && payment_fx_details;
    metadata.networkReference = remote_transaction_id && remote_transaction_id;
    metadata.providerCharge = {
      amount: feeAmount,
      ...(fee_transaction && {
        description: fee_transaction?.description,
        type: fee_transaction?.type,
        currency: fee_transaction?.currency,
        accountCharged: fee_transaction?.account.id,
      }),
    };

    let reason;

    switch (status) {
      case 'cancelled':
        reason = rest.cancelled_reason;
        break;
      case 'rejected':
        reason = rest.rejected_reason;
        break;
      case 'processed_with_errors':
        reason = rest.last_error;
        break;
      default:
        reason = null;
        break;
    }
    // metadata.fundersNetwork = contact.network_name;

    const txPurpose = Settings.get('TRANSACTION_PURPOSE');
    let { purpose } = txPurpose['cash-out'];
    let returnData: any;
    // if (transaction_type === txPurpose['cash-out']) {
    // eslint-disable-next-line no-prototype-builtins
    if (txPurpose.hasOwnProperty(transaction_type)) {
      purpose = txPurpose['cash-out'].purpose;
      returnData = { uniquePaymentId: username };
    }

    console.log({ returnData });

    return {
      success: true,
      data: {
        ...returnData,
        narration: `${transactionId}-${remote_transaction_id}-${type}-${accountId}`,
        description,
        channel,
        amount,
        fee: feeAmount * 100,
        currency,
        metadata,
        purpose,
        reason,
        reference,
        requestId,
        status: Service.getBayonicStatus(status),
      },
    };
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

  // Update the mobile Money payment transactions

  async updateMobileMoneyPayments(payload: mobileMoneyPaymentDTO) {
    const { amount, reason, narration, fee, reference, status, requestId, incomingStatus, metadata } = payload.data;
    const { statusCode, statusMessage, slackSetup, thirdPartySetup } = payload;

    const mobileMoneyPaymentRecord = await getMobileMoneyPaymentREPO({ transaction_reference: reference, processor_reference: requestId }, []);
    if (!mobileMoneyPaymentRecord) {
      const thirdParty = await thirdPartySetup
        .withMessage(`Mobile-Money-Payment:Failed:${incomingStatus}`)
        .withStatusCode('400')
        .logThirdPartyResponse();
      await slackSetup.withReason('Mobile Money Payment Record Not Found').withThirdParty(thirdParty.id).sendSlackMessage('payment_notification');
      return { success: false };
    }
    await updateMobileMoneyPaymentREPO(
      { id: mobileMoneyPaymentRecord.id },
      {
        status,
        ...(reason && { reason }),
        ...(mobileMoneyPaymentRecord.narration.includes('undefined') && {
          narration,
          metadata,
          fee,
        }),
      },
    );

    const thirdParty = await thirdPartySetup
      .withStatusCode(statusCode || '200')
      .withMessage(statusMessage || `Mobile-Money-Payment:${incomingStatus}`)
      .logThirdPartyResponse();

    console.log('saveMobileMoneyTransaction');
    return { success: true, data: { thirdParty } };
  },

  // Completes A Mobile Money Payment
  async completeMobileMoneyPayments(payload: mobileMoneyPaymentDTO) {
    const { incomingStatus, reference, purpose, metadata, status } = payload.data;
    const { statusCode, slackSetup, thirdPartySetup } = payload;
    try {
      const {
        Wallet: wallet,
        User: user,
        description,
        amount,
        currency,
        metadata: transactionMetadata,
        created_at,
        id,
      } = await getOneTransactionREPO({ reference, txn_type: 'debit', channel: 'mobile-money' }, [], ['User', 'Wallet', 'Reciepts']);

      await updateTransactionREPO({ id }, { status: STATUSES.SUCCESS });
      // Notify EveryOne for Transaction Completion
      Service.mobileMoneyPaymentNotification({ user, wallet, created_at, description, amount, currency, reference, type: 'debit' });
    } catch (error) {
      console.log({ error });
      // await t.rollbackTransaction();
    } finally {
      // await t.release();
    }
  },

  // Failes A Mobile Money Payment
  async failMobileMoneyPayments(payload: mobileMoneyPaymentDTO) {
    const { incomingStatus, reference, purpose, metadata, status } = payload.data;
    const { statusCode, slackSetup, thirdPartySetup } = payload;
    let { thirdParty } = payload;

    try {
      const transactionRecord = await getOneTransactionREPO({ reference, txn_type: 'debit', channel: 'mobile-money' }, [], ['Wallet', 'Wallet.User']);
      if (!transactionRecord) {
        thirdParty = thirdParty
          ? await thirdPartySetup.withMessage(`Mobile-Money-Payment:Failed:${incomingStatus}`).withStatusCode('400').logThirdPartyResponse()
          : thirdParty;
        await slackSetup.withReason('Transaction Not Found').withThirdParty(thirdParty.id).sendSlackMessage('payment_notification');
        return;
      }
      const { Wallet: wallet, User: user, description, amount, currency, metadata: transactionMetadata, created_at } = transactionRecord;
      await WalletService.creditWallet({
        amount: transactionMetadata.amountWithFees || amount,
        user: transactionRecord.Wallet.User,
        wallet_id: transactionRecord.Wallet.id,
        purpose: 'reversal',
        description: 'Reversal of Debit',
        metadata,
        reference,
        noTransaction: true,
      });
      await updateTransactionREPO({ id: transactionRecord.id }, { status: STATUSES.FAILED, metadata });

      // Notify EveryOne for Transaction Completion
      Service.mobileMoneyPaymentNotification({
        user,
        wallet,
        created_at,
        description,
        amount,
        currency,
        reference,
        type: 'credit',
        purpose,
        username: metadata.username,
        from: metadata.fundersPhone || metadata.paymentContact.phone_number,
      });
    } catch (error) {
      console.log({ error });
      // await t.rollbackTransaction();
    } finally {
      // await t.release();
    }
  },

  async mobileMoneyPaymentNotification(payload: any) {
    const {
      notifyAdmin = false,
      from,
      user,
      wallet,
      created_at,
      description,
      amount,
      currency,
      reference,
      type,
      method = 'mobile-money',
      purpose,
      username,
    } = payload;
    try {
      const { data } = await PreferenceService.getNotificationContacts(wallet.entity_id);
      const { emails, phoneNumbers, transactions: transactionNotification } = data;
      const { notifyInflow, notifyOutflow } = transactionNotification;
      const extractedPurpose = purpose && purpose.split(':').pop().replace('-', ' ');
      const extractedStudent = description && description.split(' for ').pop();
      // const extractedSchool = extractedStudent && extractedStudent.split(' at ').pop();
      const student: { [key: string]: any } = {};

      // For Student
      if (username.length === 9) {
        const foundStudent = await getStudent({ uniqueStudentId: username }, [], ['User', 'School', 'Classes', 'Classes.ClassLevel']);
        if (!foundStudent) throw new ValidationError('Completing payment Notification Failed');

        const { User, School, Classes, Fees } = foundStudent;
        const [studentCurrentClass] = Classes && Classes.filter((value: IStudentClass) => value.status === STATUSES.ACTIVE);
        const { class: ClassName, class_short_name } = studentCurrentClass.ClassLevel;
        student.name = `${User.first_name} ${User.last_name}`;
        student.school = `${School.name}`;
        student.class = `${ClassName}(${class_short_name})`;
      }
      if (notifyInflow.includes('phoneNumbers'))
        sendSms({
          phoneNumber: phoneNumbers,
          message: `STEWARD Transaction Notification\n\nFrom: ${from}\nAmt: ${
            currency || 'UGX'
          }${amount}\nType: ${type}\nPrps: ${extractedPurpose}\nBy: ${method}\nBal: ${wallet.currency}${wallet.balance / 100}\nFor: ${
            student.name || extractedStudent
          }\nClass: ${student.class}\nSch: ${student.school}`,
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
      if (notifyAdmin) {
        await sendSlackMessage({
          body: {
            amount: `${currency || 'UGX'}${amount}`,
            reference,
            from,
            schoolName: student.school,
            // initiator: `${user.first_name} ${user.last_name}`,
            createdAt: `${created_at}`,
            For: `${student.name || extractedStudent}`,
            class: `${student.class}`,
            channel: method,
            narration: description,
            purpose: extractedPurpose,
          },
          feature: 'deposit_notification',
        });
      }
    } catch (error) {
      console.log({ error });
      // await t.rollbackTransaction();
    } finally {
      // await t.release();
    }
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

      // Notify EveryOne for Transaction Completion
      Service.mobileMoneyPaymentNotification({
        user,
        wallet,
        created_at: metadata.completed_at,
        description,
        amount: transactionMetadata.amount / 100,
        currency,
        reference,
        type: 'Credit',
        purpose,
        username: metadata.username,
        notifyAdmin: true,
        from: metadata.fundersPhone || metadata.paymentContact.phone_number,
      });
    } catch (error) {
      console.log({ error });
      // await t.rollbackTransaction();
    } finally {
      // await t.release();
    }
  },
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

export async function bayonicPaymentHandler(payload: any): Promise<any> {
  const { state: incomingStatus, id: reference } = payload;
  const txData = await Service.generateMobileMoneyPaymentData(payload);

  txData.data.incomingData = payload;
  txData.data.incomingStatus = incomingStatus;

  let { school } = payload;
  const { amount, currency, metadata, start_date } = payload;
  const { incomingData, metadata: extraData } = txData.data;

  if (!school) school = await getSchool({ code: metadata.school }, []);
  const baseNotification = new NotificationHandler().withEvent('payment.status.changed').withProvider('BEYONIC').withReference(reference);
  const thirdPartySetup = baseNotification
    .withEndpoint(`${STEWARD_BASE_URL}/webhook/beyonic`)
    .withEndpointVerb('POST')
    .withSchool(school.id)
    .withProviderType('payment-provider')
    .withPayload(JSON.stringify(incomingData));
  const slackSetup = baseNotification
    .withAmount(`${currency}${amount / 100}`)
    .withAction('Required:Complete-Payment')
    .withPaymentType('mobile-money')
    .withEventType('webhook')
    .withSchoolName(school.name)
    .withPhoneNumber(extraData.fundersPhone)
    .withStartDate(start_date);

  const updatePayload = { ...txData, thirdPartySetup, slackSetup };

  switch (incomingStatus) {
    case 'scheduled': {
      await Service.updateMobileMoneyPayments(updatePayload);
      break;
    }
    case 'cancelled': {
      const { success, data: responseData } = await Service.updateMobileMoneyPayments({ ...updatePayload, statusCode: '400' });
      if (success)
        await Service.failMobileMoneyPayments({
          ...updatePayload,
          ...(responseData && { thirdParty: responseData.thirdParty }),
        });
      break;
    }
    case 'processed': {
      const { success } = await Service.updateMobileMoneyPayments(updatePayload);
      if (success) await Service.completeMobileMoneyPayments(updatePayload);
      break;
    }
    case 'rejected': {
      const { success, data: responseData } = await Service.updateMobileMoneyPayments({
        ...updatePayload,
        statusCode: '400',
        statusMessage: `Mobile-Money-Payment:Failed:${incomingStatus}`,
      });
      if (success)
        await Service.failMobileMoneyPayments({
          ...updatePayload,
          ...(responseData && { thirdParty: responseData.thirdParty }),
        });
      break;
    }
    case 'processed_with_errors': {
      await Service.updateMobileMoneyPayments(updatePayload);
      const thirdParty = await thirdPartySetup
        .withMessage(`Mobile-Money-Payment:PROCESSED:${incomingStatus}`)
        .withStatusCode('200')
        .logThirdPartyResponse();
      await slackSetup.withReason('Processed the Transaction with Errors').withThirdParty(thirdParty.id).sendSlackMessage('payment_notification');
      break;
    }
    default:
      break;
  }
}

export default Service;
