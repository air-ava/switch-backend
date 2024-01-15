import { bankTransferDTO, validateAccountDetailsDTO, validateAccountDetailsRES } from '../dto/transfer.dto';
import { bankTransfer, nameEnquiry } from '../integration/wema/banks';
import { publishMessage } from '../utils/amqpProducer';
import { catchIntegrationWithThirdPartyLogs, sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';

const Service = {
  async validateAccountDetails(payload: validateAccountDetailsDTO): Promise<theResponse> {
    const { accountNumber, bankCode } = payload;

    const accountName = await catchIntegrationWithThirdPartyLogs(nameEnquiry, bankCode, accountNumber);
    return sendObjectResponse('Successfully retrieved account', { accountName });
  },

  async bankTransfer(payload: bankTransferDTO): Promise<theResponse> {
    const { bankCode, recipientAccountNumber, recipientAccountName, originatorAccountNumber, originatorAccountName, narration, reference, amount } =
      payload;

    const accountName = await catchIntegrationWithThirdPartyLogs(bankTransfer, {
      bankCode,
      recipientAccountNumber,
      recipientAccountName,
      originatorAccountNumber,
      originatorAccountName,
      narration,
      reference,
      amount,
    });

    // todo: queue: create a cron to check if transaction has been completed, conditionally when response isn't positive
    publishMessage('bank:transfer:verification', { purpose, recipientEmail, templateInfo });
    return sendObjectResponse('Successfully transfered account', { accountName });
  },
};

export default Service;
