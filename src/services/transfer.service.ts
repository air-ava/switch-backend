import { v4 } from 'uuid';
import numeral from 'numeral';
import { bankTransferDTO, validateAccountDetailsDTO, validateAccountDetailsRES } from '../dto/transfer.dto';
import { bankTransfer, nameEnquiry } from '../integration/wema/banks';
import { publishMessage } from '../utils/amqpProducer';
import { BadRequestException, NotFoundError, ValidationError, catchIntegrationWithThirdPartyLogs, sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import Settings from './settings.service';
import Utils from '../utils/utils';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import BankRepo from '../database/repositories/banks.repo';
import ReservedAccountREPO from '../database/repositories/reservedAccount.repo';
import { dbTransaction, getQueryRunner } from '../database/helpers/db';
import BankTransferService from './bankTransfer.service';
import BankTransferRepo from '../database/repositories/bankTransfer.repo';
import { STATUSES } from '../database/models/status.model';
import { Service as WalletService } from './wallet.service';
import { getOneTransactionREPO, updateTransactionREPO } from '../database/repositories/transaction.repo';
import { sendSlackMessage } from '../integration/extra/slack.integration';
import { QueryRunner } from 'typeorm';

const dependency = 'wemabank.com';

const Service = {
  async validateAccountDetails(payload: validateAccountDetailsDTO): Promise<theResponse> {
    const { accountNumber, bankCode } = payload;

    const accountName = await catchIntegrationWithThirdPartyLogs(nameEnquiry, bankCode, accountNumber);
    return sendObjectResponse('Successfully retrieved account', { accountName });
  },

  async bankTransfer(data: bankTransferDTO): Promise<theResponse> {
    const {
      bankCode,
      recipientAccountNumber,
      recipientAccountName,
      senderAccountNumber,
      senderAccountName,
      narration,
      amount,
      transactionPin,
      note,
    } = data;

    const school = Settings.get('SCHOOL');
    const user = Settings.get('USER');
    const channel = 'bank-transfer';
    const { purpose } = Settings.get('TRANSACTION_PURPOSE')['bank-transfer'];
    const reference = v4();

    // ? bank Check
    const bank = await BankRepo.getBank({ bank_code: bankCode }, []);
    if (!bank) throw new NotFoundError('Bank');

    if (recipientAccountNumber.substr(0, 3) === Utils.getWemaPrefix() && bankCode === '000017') {
      const accountDetails = await ReservedAccountREPO.getReservedAccount({ reserved_account_number: recipientAccountNumber }, [
        'reserved_account_name',
        'entity',
        'entity_id',
      ]);
      if (!accountDetails) throw new ValidationError(`Invalid Account`);
      // todo: walletToWalletTransfer
    }

    const { data: transferInitiated } = await dbTransaction(Service.initiateBankTransfer, {
      bankCode,
      recipientAccountNumber,
      recipientAccountName,
      originatorAccountNumber: senderAccountNumber,
      originatorAccountName: senderAccountName,
      narration,
      amount,
      transactionPin,
      note,
      school,
      user,
      channel,
      reference,
      purpose,
      bank,
    });
    const { wallet, foundBank, createdBankTransfer, transaction, metadata } = transferInitiated;

    const payload = {
      bankCode,
      recipientAccountNumber,
      recipientAccountName,
      originatorAccountNumber: senderAccountNumber,
      originatorAccountName: senderAccountName,
      narration,
      reference,
      amount,
    };
    const bankTransferResponse = await catchIntegrationWithThirdPartyLogs(
      bankTransfer,
      {
        dependency,
        method: 'POST',
        school: Settings.get('SCHOOL'),
        provider: Settings.get('PROVIDERS'),
        payload,
        event: 'wema.bank.transfer:failure',
      },
      payload,
    );
    await BankTransferRepo.updateBankTransfer(
      { tx_reference: reference },
      { updated_at: new Date(), response: 'Transfer successful', status: STATUSES.PROCESSED, sessionId: bankTransferResponse.message },
    );

    // const fees = Settings.get('TRANSACTION_FEES');
    const feesNames = ['debit-fees'];
    publishMessage('debit:transaction:charge', { feesNames, purpose, wallet, amount, narration, metadata, reference });
    publishMessage('bank:transfer:verification', { reference, wallet, school, foundBank, user, amount, narration, transaction });

    const successMessage = `Your transfer of NGN${numeral(amount / 100).format(
      '0,0.00',
    )} to ${senderAccountName.toUpperCase()} (${bank.name.toUpperCase()}) has been successfully processed.`;
    publishMessage('app:notification', {
      reciever_id: school.id,
      reciever: 'school',
      display_type: 'POP_UP',
      action_type: 'INFO',
      urgency_type: 'LOW',
      reference_code: reference,
      title: `transfer of NGN${numeral(amount / 100).format('0,0.00')}`,
      body: successMessage,
      school,
    });
    publishMessage('email:notification', {
      purpose: 'bank_transfer',
      recipientEmail: school.email,
      templateInfo: {
        amount: `${wallet.currency}${amount / 100}`,
        reference,
        bankName: foundBank.bank_name,
        schoolName: school.name,
        initiator: `${user.first_name} ${user.last_name}`,
        createdAt: `${createdBankTransfer.created_at}`,
        accountName: foundBank.account_name,
        narration,
        accountNumber: foundBank.number,
      },
    });

    return sendObjectResponse('Successfully transfered account', transaction);
  },

  async initiateBankTransfer(t: QueryRunner, data: any): Promise<theResponse> {
    const {
      bankCode,
      recipientAccountNumber,
      recipientAccountName,
      originatorAccountNumber: senderAccountNumber,
      originatorAccountName: senderAccountName,
      narration,
      amount,
      transactionPin,
      note,
      school,
      user,
      channel,
      reference,
      purpose,
      bank,
    } = data;

    const wallet = await WalletREPO.findWallet({ userId: user.id, entity: 'school', entity_id: school.id }, ['id', 'currency', 'userId'], t);
    if (!wallet) throw new NotFoundError('Wallet');

    const { data: foundBank } = await BankTransferService.findOrCreateBankAccount({
      bankDetails: {
        country: Settings.get('COUNTRY'),
        number: recipientAccountNumber,
        bank_name: bank.name,
        bank_routing_number: bankCode,
        account_name: recipientAccountName,
      },
      t,
      wallet,
    });

    const metadata = {
      destination_account_number: foundBank.number,
      destination_bank: foundBank.bank_name,
      destination_account_name: foundBank.account_name,
      destination_bank_code: bankCode,
    };

    const createdBankTransfer = await BankTransferRepo.saveBankTransfer(
      {
        amount: Number(amount),
        status: STATUSES.INITIATED,
        bankId: foundBank.id,
        narration,
        tx_reference: reference,
        processor: 'WEMA',
        walletId: wallet.id,
      },
      t,
    );

    const debitResult = await WalletService.debitWallet({
      user,
      amount,
      description: narration,
      note: note && note,
      purpose,
      channel,
      status: STATUSES.PROCESSING,
      reference,
      transactionPin,
      wallet_id: wallet.id,
      metadata,
      t,
    });
    if (!debitResult.success) {
      await BankTransferRepo.updateBankTransfer(
        { tx_reference: reference },
        { updated_at: new Date(), response: debitResult.error, status: STATUSES.FAILED },
        t,
      );
      throw new ValidationError(`${debitResult.error}`);
    }

    const transaction = await getOneTransactionREPO({ reference }, ['description', 'metadata', 'amount', 'walletId'], [], t);

    return sendObjectResponse('Successfully initiated transfer', { wallet, foundBank, createdBankTransfer, transaction, metadata });
  },
};

export default Service;
