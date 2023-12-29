/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { v4 } from 'uuid';
import logger from '../utils/logger';
import ValidationError from '../utils/validationError';
import { Repo as WalletRepo } from '../database/repositories/wallet.repo';
import ReservedAccount from '../database/repositories/reservedAccount.repo';
import { wemaAccountResponse } from '../utils/errors';
import { accountNumberValidator, incomingDepositValidator } from '../validators/webhook.validator';
import ReservedAccountService from '../services/reservedAccount.service';
import { sendSlackMessage } from '../integrations/extra/slack.integration';
import { saveThirdPartyLogsREPO } from '../database/repositories/thirdParty.repo';
import { STEWARD_BASE_URL } from '../utils/secrets';

const Webhook = {
  async verifyAccountNumber(data: any) {
    const { accountnumber } = data;
    const validation = accountNumberValidator.validate(data);
    logger.info(JSON.stringify(data));
    if (validation.error) throw new ValidationError('Invalid account');

    const accountDetails = await ReservedAccount.getReservedAccount({ reserved_account_number: accountnumber }, ['reserved_account_name']);
    if (!accountDetails) throw new ValidationError('Invalid account');

    return wemaAccountResponse('00', 'Successfully retreived account', { accountname: accountDetails.reserved_account_name });
  },

  async incomingDeposit(data: any) {
    const { accountnumber, bankname, originatorname } = data;
    let { originatoraccountnumber } = data;

    const reference = v4();

    const validation = incomingDepositValidator.validate(data);
    logger.info(JSON.stringify(data));
    if (validation.error) {
      logger.error(validation.error);
      sendSlackMessage({
        body: {
          amount: Number(data.amount) || 0,
          reference: data.paymentreference || data.sessionid || '',
          bankName: bankname,
          accountName: data.craccountname,
          accountNumber: data.craccount,
          processorResponse: JSON.stringify(data),
        },
        feature: 'bank_transfer_failure',
      });
      throw new ValidationError(`Invalid Account`);
    }

    if (originatoraccountnumber.length > 10) originatoraccountnumber = originatoraccountnumber.substr(1, 10);
    const bankName = bankname || (originatorname === 'PALMPAY LIMITED' ? 'PALMPAY LIMITED' : 'N/A');

    const creditWallet = await ReservedAccountService.creditWalletOnReservedAccountFunding({
      originator_account_number: data.originatoraccountnumber || '0000000000',
      amount: Number(data.amount),
      originator_account_name: originatorname || bankName,
      narration: data.narration,
      reserved_account_name: data.craccountname,
      reserved_account_number: data.craccount,
      external_reference: data.paymentreference || data.sessionid,
      bank_name: bankName,
      session_id: data.sessionid,
      bank_code: data.bankcode,
      reference,
    });
    if (!creditWallet.success) throw new ValidationError(creditWallet.error);

    const { school, reference: transactionreference } = creditWallet.data;
    // todo: add 3rd party logging
    saveThirdPartyLogsREPO({
      event: 'wema.deposit.notification',
      message: `Wema-Deposit-Webhook:${data.paymentreference || data.sessionid}`,
      endpoint: `${STEWARD_BASE_URL}/webhook/wema/deposit`,
      school: school.id,
      endpoint_verb: 'POST',
      status_code: '200',
      payload: JSON.stringify(data),
      provider_type: 'payment-provider',
      provider: 'WEMA',
      reference: transactionreference,
    });

    return wemaAccountResponse('00', 'Successfully credited account', { transactionreference });
  },
};

export default Webhook;
