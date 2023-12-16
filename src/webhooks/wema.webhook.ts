/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import logger from '../utils/logger';
import ValidationError from '../utils/validationError';
import { Repo as WalletRepo } from '../database/repositories/wallet.repo';
import ReservedAccount from '../database/repositories/reservedAccount.repo';
import { invalidAccountResponse } from '../utils/errors';
import { accountNumberValidator, incomingDepositValidator } from '../validators/webhook.validator';
import { sendSlackMessage } from '../integrations/extra/slack.integration';

const Webhook = {
  async verifyAccountNumber(data: any) {
    const { accountnumber } = data;
    const validation = accountNumberValidator.validate(data);
    logger.info(JSON.stringify(data));
    if (validation.error) return invalidAccountResponse('07', 'Invalid account');

    const accountDetails = await ReservedAccount.getReservedAccount({ reserved_account_number: accountnumber }, ['reserved_account_name']);
    if (!accountDetails) return invalidAccountResponse('07', 'Invalid account');

    return invalidAccountResponse('00', 'Successfully retreived account', { accountname: accountDetails.reserved_account_name });
  },

  async incomingDeposit(data: any) {
    const { accountnumber, bankname } = data;
    let { originatoraccountnumber } = data;

    const validation = incomingDepositValidator.validate(data);
    logger.info(JSON.stringify(data));
    if (validation.error) {
      logger.error(validation.error);
      //   sendSlackMessage({
      //     body: {
      //       processorResponse,
      //       bankName,
      //       accountName,
      //       reference,
      //       amount,
      //     },
      //     feature: 'bank_transfer_failure',
      //   });
    }

    if (originatoraccountnumber.length > 10) originatoraccountnumber = originatoraccountnumber.substr(1, 10);

    const accountDetails = await ReservedAccount.getReservedAccount({ reservedAccountNumber: accountnumber }, ['reserved_account_name']);
    if (!accountDetails) return invalidAccountResponse('07', 'Invalid account');

    return invalidAccountResponse('00', 'Successfully retreived account', { accountname: accountDetails.reserved_account_name });
  },
};

export default Webhook;
