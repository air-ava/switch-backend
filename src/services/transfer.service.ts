import { validateAccountDetailsDTO, validateAccountDetailsRES } from '../dto/transfer.dto';
import { nameEnquiry } from '../integrations/wema/banks';
import { catchIntegrationWithThirdPartyLogs, sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';

const Service = {
  async validateAccountDetails(payload: validateAccountDetailsDTO): Promise<theResponse> {
    const { accountNumber, bankCode } = payload;

    const accountName = await catchIntegrationWithThirdPartyLogs(nameEnquiry, bankCode, accountNumber);
    return sendObjectResponse('Successfully retrieved account', { accountName });
  },
};

export default Service;
