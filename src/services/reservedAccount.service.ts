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
import { WEMA_ACCOUNT_PREFIX } from '../utils/secrets';
import { Service as WalletService } from './wallet.service';
import Utils from '../utils/utils';
import { creditWalletOnReservedAccountFundingSCHEMA } from '../validators/reservedAccount.validator';
import { getTransactionByExternalRef, getTransactionsREPO, updateTransactionREPO } from '../database/repositories/transaction.repo';
import { dbTransaction, getQueryRunner } from '../database/helpers/db';
import { publishMessage } from '../utils/amqpProducer';
import Settings from './settings.service';
import logger from '../utils/logger';
import { IUser, IWallets } from '../database/modelInterfaces';

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

  async creditWalletOnReservedAccountFunding(data: creditWalletOnReservedAccountFundingDTO): Promise<theResponse> {
    const { amount: fixedAmount, originator_account_name, reserved_account_number, external_reference } = data;

    const amount = Utils.convertCurrencyToSmallerUnit(fixedAmount);
    const reference = v4();

    const validation = creditWalletOnReservedAccountFundingSCHEMA.validate({ ...data, amount });
    if (validation.error) throw new ValidationError(validation.error.message);

    const accountDetails = await ReservedAccountREPO.getReservedAccount({ reserved_account_number }, ['reserved_account_name', 'entity'], ['Wallet']);
    if (!accountDetails) throw new ValidationError(`Invalid Account`);

    const purpose = accountDetails.entity === 'student' ? 'Payment:School-Fees' : 'Funding:Wallet-Top-Up';

    const wallet = await WalletREPO.findWallet({ id: accountDetails.Wallet.id }, ['id', 'currency'], ['User']);
    if (!wallet) throw new ValidationError(`Not connected to a wallet`);

    const metadata = {
      sender_name: originator_account_name,
      external_reference,
      ...(wallet.business_account_number_prefix && { inflow_account: reserved_account_number }),
    };

    const completedDeposit = await dbTransaction(Service.completeWalletDeposit, { ...data, purpose, metadata, wallet, amount, reference });

    // todo: recording a reserved acccount funding should be a queue, same with mobi;e money funding
    dbTransaction(Service.recordReservedAccountTransaction, { ...data, purpose, wallet, wallet_id: wallet.id, metadata, amount, reference });

    // ?for fee Charges
    // todo: put debit transaction fee into a queue
    dbTransaction(Service.completeTransactionCharge, { ...data, purpose, wallet, metadata, amount, reference });

    // todo: Notifications
    Service.completeTransactionNotification({ user: wallet.User, wallet, amount, reference, originator_account_name });

    return completedDeposit;
  },

  async completeWalletDeposit(queryRunner: QueryRunner, data: any): Promise<theResponse> {
    const { purpose, wallet, amount, narration, external_reference, reference, metadata } = data;

    const transaction = await getTransactionByExternalRef(external_reference, queryRunner);
    if (transaction.length) throw new ValidationError(`Duplicate transaction`);

    const creditResult = await WalletService.creditWallet({
      amount,
      user_mobile: wallet.user_mobile,
      wallet_id: wallet.id,
      purpose,
      description: narration,
      reference,
      t: queryRunner,
      metadata,
    });

    if (!creditResult.success) {
      throw new ValidationError(creditResult.error);
      // todo: notify slack
      // todo: save in thirdparty logs
    }

    return sendObjectResponse(`deposit process completed`, {
      ...creditResult,
      data: { reference },
    });
  },

  async completeTransactionCharge(t: QueryRunner, data: any): Promise<theResponse> {
    const { purpose, wallet, amount, narration, metadata, reference } = data;

    const {
      success: debitSuccess,
      data: transactionFees,
      error: debitError,
    } = await WalletService.debitTransactionFees({
      wallet_id: wallet.id,
      reference,
      user: wallet.User,
      description: narration,
      feesNames: ['debit-fees'],
      transactionAmount: amount,
      t,
    });
    if (!debitSuccess) throw debitError;

    const feesConfig = Settings.get('TRANSACTION_FEES');
    const feesPurposeNames: string[] = [feesConfig['debit-fees'].purpose];
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

    const transaction = await getTransactionsREPO({ reference, purpose }, [], ['User', 'Wallet', 'Reciepts'], t);
    if (!transaction) {
      // ?consumerException(`No transaction with reference ${reference}`);
      // todo: Add Slack Notification
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
};

export default Service;
