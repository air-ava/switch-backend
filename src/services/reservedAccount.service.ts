/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
import randomstring from 'randomstring';
import { v4 } from 'uuid';
import numeral from 'numeral';
import { In, Not, QueryRunner } from 'typeorm';
import { getSchool } from '../database/repositories/schools.repo';
import { getStudent } from '../database/repositories/student.repo';
import { assignAccountNumberDTO, creditWalletOnReservedAccountFundingDTO } from '../dto/reservedAccount.dto';
import { NotFoundError, ValidationError, consumerException, sendObjectResponse } from '../utils/errors';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import ReservedAccountREPO from '../database/repositories/reservedAccount.repo';
import ReservedAccountTransactionREPO from '../database/repositories/reservedAccountTransaction.repo';
import { theResponse } from '../utils/interface';
import { STEWARD_BASE_URL, WEMA_ACCOUNT_PREFIX } from '../utils/secrets';
import { Service as WalletService } from './wallet.service';
import Utils, { toCamel } from '../utils/utils';
import { creditWalletOnReservedAccountFundingSCHEMA } from '../validators/reservedAccount.validator';
import {
  getOneTransactionREPO,
  getTransactionByExternalRef,
  getTransactionsByExternalReference,
  getTransactionsREPO,
  updateTransactionREPO,
} from '../database/repositories/transaction.repo';
import { dbTransaction, getQueryRunner } from '../database/helpers/db';
import { publishMessage } from '../utils/amqpProducer';
import Settings from './settings.service';
import logger from '../utils/logger';
import { IUser, IWallets } from '../database/modelInterfaces';
import { saveThirdPartyLogsREPO } from '../database/repositories/thirdParty.repo';
import { sendSlackMessage } from '../integration/extra/slack.integration';
import { createPaymentContacts, findOrCreatePaymentContacts } from '../database/repositories/paymentContact.repo';
import { STATUSES } from '../database/models/status.model';
import { Sanitizer } from '../utils/sanitizer';
import { Repo as DocumentREPO } from '../database/repositories/documents.repo';

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
    const { holder, holderId, school } = data;
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

    const wallet = await WalletREPO.findWallet({ entity: 'school', entity_id: school.id, type: 'permanent' }, ['id', 'currency']);
    if (!wallet) throw new NotFoundError(`Wallet`);

    const reservedAccountNumber = await Service.createUniqueAccountNumber();
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

  async creditWalletOnReservedAccountFunding(data: creditWalletOnReservedAccountFundingDTO): Promise<theResponse> {
    const { amount: fixedAmount, originator_account_name, reserved_account_number, narration, external_reference } = data;

    const amount = Utils.convertCurrencyToSmallerUnit(fixedAmount);
    // const reference = reference || v4();
    const { reference, ...rest } = data;
    const validation = creditWalletOnReservedAccountFundingSCHEMA.validate({ ...rest, amount });
    if (validation.error) throw new ValidationError(validation.error.message);

    const accountDetails = await ReservedAccountREPO.getReservedAccount(
      { reserved_account_number, status: Not(In([STATUSES.DELETED, STATUSES.BLOCKED])) },
      ['reserved_bank_name', 'reserved_account_number', 'reserved_account_name', 'entity', 'entity_id'],
      ['Wallet'],
    );
    if (!accountDetails) throw new ValidationError(`Invalid Account`);

    let purpose = 'Funding:Wallet-Top-Up';
    let student;
    if (accountDetails.entity === 'student') {
      purpose = 'Payment:School-Fees';
      student = await getStudent({ id: accountDetails.entity_id }, [], ['Fees']);
    }

    const wallet = await WalletREPO.findWallet({ id: accountDetails.Wallet.id }, ['id', 'currency', 'entity', 'entity_id'], undefined, ['User']);
    if (!wallet) throw new ValidationError(`Not connected to a wallet`);

    let school;
    if (wallet.entity === 'school') school = await getSchool({ id: wallet.entity_id }, []);

    const metadata = {
      sender_name: originator_account_name,
      external_reference,
      reference: external_reference || '',
      sessionId: data.session_id,
      sender_bank: data.bank_name,
      sender_number: data.originator_account_number,
      recipient_number: accountDetails.reserved_account_number,
      recipient_name: accountDetails.reserved_account_name,
      recipient_bank: accountDetails.reserved_bank_name,
      ...(wallet.business_account_number_prefix && { inflow_account: reserved_account_number }),
    };

    const completedDeposit = await dbTransaction(Service.completeWalletDeposit, {
      ...data,
      purpose,
      metadata,
      wallet,
      amount,
      reference,
      school,
      channel: 'bank-transfer',
    });
    const paymentContact = await createPaymentContacts({
      school: school?.id,
      name: originator_account_name,
      status: STATUSES.ACTIVE,
    });

    publishMessage('record:reserved:account:deposit', { ...data, purpose, wallet, wallet_id: wallet.id, metadata, amount, reference });
    publishMessage('debit:transaction:charge', { feesNames: ['debit-fees'], purpose, wallet, amount, narration, metadata, reference });
    publishMessage('record:student:installmental:payment', { paymentContact, amount, metadata, reference, student });

    // todo: Notifications
    Service.completeTransactionNotification({ user: wallet.User, wallet, amount, reference, originator_account_name });

    return sendObjectResponse(`${completedDeposit.message}`, { ...completedDeposit.data, school, reference });
  },

  async completeWalletDeposit(queryRunner: QueryRunner, data: any): Promise<theResponse> {
    const { school, purpose, wallet, amount, narration, external_reference, reference, metadata, channel } = data;

    const transaction = await getTransactionsByExternalReference(external_reference, queryRunner);
    if (transaction.length) throw new ValidationError(`Duplicate transaction`);

    const creditResult = await WalletService.creditWallet({
      amount,
      user: wallet.User,
      wallet_id: wallet.id,
      purpose,
      ...(channel && { channel }),
      reference,
      description: narration,
      t: queryRunner,
      metadata,
    });

    if (!creditResult.success) {
      logger.error(creditResult.error);
      sendSlackMessage({
        body: {
          amount: Number(amount) || 0,
          reference: external_reference || '',
          bankName: data.bank_name,
          accountName: data.originator_account_name,
          accountNumber: data.originator_account_number,
          processorResponse: JSON.stringify(data),
        },
        feature: 'bank_transfer_failure',
      });
      saveThirdPartyLogsREPO({
        event: 'wema.deposit.notification:failure',
        message: `Wema-Deposit-Webhook:${external_reference}`,
        endpoint: `${STEWARD_BASE_URL}/webhook/wema/deposit`,
        school: school.id,
        endpoint_verb: 'POST',
        status_code: '200',
        payload: JSON.stringify(data),
        provider_type: 'payment-provider',
        provider: 'WEMA',
        reference: external_reference,
      });
      throw new ValidationError(creditResult.error);
    }

    return sendObjectResponse(`deposit process completed`, {
      ...creditResult,
      data: { reference },
    });
  },

  generateFeePurposeNames(
    feesNames: string[],
    feesConfig: {
      [feeName: string]: { purpose: string };
    },
  ): string[] {
    return feesNames.map((feeName) => feesConfig[feeName].purpose);
  },

  async completeTransactionCharge(t: QueryRunner, data: any): Promise<theResponse> {
    const { purpose, wallet, amount, narration, metadata, reference, feesNames } = data;

    const {
      success: debitSuccess,
      data: transactionFees,
      error: debitError,
    } = await WalletService.debitTransactionFees({
      wallet_id: wallet.id,
      reference,
      user: wallet.User,
      description: narration,
      feesNames,
      transactionAmount: amount,
      t,
    });
    if (!debitSuccess) throw debitError;

    const feesConfig = Settings.get('TRANSACTION_FEES');
    const feesPurposeNames: string[] = Service.generateFeePurposeNames(feesNames, feesConfig);
    // const feesPurposeNames: string[] = [feesConfig['debit-fees'].purpose];
    await updateTransactionREPO(
      { reference, purpose: Not(In(feesPurposeNames)) },
      {
        metadata: {
          ...metadata,
          transactionFees,
          fees: feesPurposeNames,
        },
      },
      t,
    );

    return sendObjectResponse(`charge process completed`, {
      ...transactionFees,
      data: { reference },
    });
  },

  async recordReservedAccountTransaction(t: QueryRunner, data: any): Promise<theResponse> {
    const {
      originator_account_number,
      originator_account_name,
      response,
      bank_name,
      session_id: sessionId,
      bank_code,
      purpose,
      wallet,
      amount,
      narration,
      metadata,
      reference,
      bank_routing_number,
    } = data;

    const transaction = await getOneTransactionREPO({ reference, purpose }, [], ['User', 'Wallet', 'Reciepts'], t);
    if (!transaction) {
      logger.error(data);
      publishMessage('slack:notification', {
        body: {
          amount: Number(amount) || 0,
          reference: reference || '',
          bankName: bank_name,
          accountName: originator_account_name,
          accountNumber: originator_account_number,
          processorResponse: JSON.stringify(data),
        },
        feature: 'bank_transfer_failure',
      });
      throw new ValidationError(`No transaction with reference ${reference}`);
    }

    const reservedAccountTransaction = await ReservedAccountTransactionREPO.createReservedAccountTransaction(
      {
        transactionId: transaction.id,
        walletId: wallet.id,
        amount,
        originator_account_name,
        originator_account_number,
        bank_name,
        bank_routing_number: bank_routing_number && bank_routing_number,
        bank_code,
        processor: 'WEMA',
        sessionId,
        response,
        narration,
      },
      t,
    );

    return sendObjectResponse(`reserved account transaction recorded successfully`, reservedAccountTransaction);
  },

  async completeTransactionNotification(data: {
    amount: number;
    user: Partial<IUser>;
    wallet: Partial<IWallets>;
    originator_account_name: string;
    reference: string;
  }): Promise<void> {
    const { amount, wallet, reference, originator_account_name } = data;
    const successMessage = `You have received NGN${numeral(amount / 100).format(
      '0,0.00',
    )} from ${originator_account_name} via your reserved bank account.`;

    // todo: Push Pop-Up Notification to Apps
    // publishMessage('pushNotificationQueue', {
    //   userMobile: wallet.user_mobile,
    //   body: successMessage,
    // });

    // todo: Add Notification to Notification Logs
    // saveNotification({
    //   user_mobile: wallet.user_mobile,
    //   type: 'reserved_bank_account_funding',
    //   body: successMessage,
    // });

    // todo: send email
    // todo: send sms
  },

  async fetchMiniStatement(data: any, gRPCConnection = false): Promise<any> {
    const { accountnumber } = data;
    const accountDetails = await ReservedAccountREPO.getReservedAccount(
      { reserved_account_number: accountnumber, status: Not(In([STATUSES.DELETED, STATUSES.BLOCKED])) },
      ['reserved_bank_name', 'reserved_account_number', 'wallet_id'],
      ['Wallet', 'Wallet.School'],
    );
    if (!accountDetails) throw new NotFoundError(`Account Number`);

    const { transactions: existingTransactions, meta } = await getTransactionsREPO(
      {
        walletId: accountDetails.wallet_id,
        channel: 'bank-transfer',
        status: Not(STATUSES.FAILED),
        // eslint-disable-next-line import/no-named-as-default-member
        to: Utils.getCurrentDate(),
        from: Utils.addDays(new Date(), -10),
      },
      ['amount', 'txn_type', 'metadata', 'created_at'],
      [],
    );

    const response = Sanitizer.sanitizeAllArray(existingTransactions, Sanitizer.sanitizeWemaStatment, accountDetails);
    return sendObjectResponse(
      'Mini-Statement fetched successfully',
      !gRPCConnection ? response : { response, school: (accountDetails.Wallet as any).School },
    );
  },

  async fetchAccountKYC(data: any, gRPCConnection = false): Promise<any> {
    const { accountnumber } = data;
    const accountDetails = await ReservedAccountREPO.getReservedAccount(
      { reserved_account_number: accountnumber, status: Not(In([STATUSES.DELETED, STATUSES.BLOCKED])) },
      ['reserved_bank_name', 'reserved_account_number', 'reserved_account_name', 'wallet_id', 'status'],
      ['Wallet', 'Wallet.User', 'Wallet.User.phoneNumber', 'Wallet.School'],
    );
    if (!accountDetails) throw new NotFoundError(`Account Number`);
    const { Wallet, reserved_account_name, status } = accountDetails;
    const { User, School, balance, entity_id } = Wallet as any;
    const { phoneNumber } = User;

    const bvnDocument = await DocumentREPO.findDocument({ type: 'BN-NUMBER', school_id: entity_id }, []);

    const response = {
      accountname: reserved_account_name,
      BVN: bvnDocument.number,
      walletbalance: balance,
      mobilenumber: Utils.removeStringWhiteSpace(phoneNumber.localFormat),
      status_desc: Sanitizer.getStatusById(STATUSES, status),
    };

    console.log({ response });
    return sendObjectResponse('Account KYC fetched successfully', !gRPCConnection ? response : { response, school: School });
  },

  async blockAccount(data: any, gRPCConnection = false): Promise<any> {
    const { accountnumber, blockreason } = data;
    const accountDetails = await ReservedAccountREPO.getReservedAccount(
      { reserved_account_number: accountnumber, status: Not(In([STATUSES.DELETED, STATUSES.BLOCKED])) },
      ['reserved_bank_name', 'reserved_account_number', 'reserved_account_name', 'wallet_id', 'status'],
      ['Wallet', 'Wallet.School'],
    );
    if (!accountDetails) throw new NotFoundError(`Account Number`);
    const { Wallet } = accountDetails;

    await ReservedAccountREPO.updateReservedAccount({ id: accountDetails.id }, { status: STATUSES.BLOCKED, reason: blockreason, blocked_by: 'WEMA' });

    return sendObjectResponse('Account Restricted Successfully', gRPCConnection && (Wallet as any).School);
  },
};

export default Service;
