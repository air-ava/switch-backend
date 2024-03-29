import axios from 'axios';
import { WEMA_VENDOR_ID, WEMA_BANK_BASE_URL, WEMA_USERNAME, WEMA_PASSWORD, NODE_ENV, ENVIRONMENT, WEMA_AUTH_TOKEN } from '../../utils/secrets';
import { get, setex } from '../../utils/redis';
import { decrypt, encrypt } from './encryption';
import logger from '../../utils/logger';
import FailedDependencyError from '../../utils/failedDependencyError';
import Settings from '../../services/settings.service';
import { saveThirdPartyLogsREPO } from '../../database/repositories/thirdParty.repo';
import { catchIntegrationWithThirdPartyLogs } from '../../utils/errors';
import Utils from '../../utils/utils';

const dependency = 'wemabank.com';

const authorize = async (): Promise<string> => {
  const authResponse = await axios.post(
    `${WEMA_BANK_BASE_URL}/Authentication/authenticate`,
    {
      username: WEMA_USERNAME,
      password: WEMA_PASSWORD,
    },
    {
      headers: {
        VendorID: WEMA_VENDOR_ID,
      },
    },
  );
  return authResponse.data.token;
};

const confirmAuth = async (): Promise<string> => {
  let authToken = await get('WEMA:AUTH:TOKEN');
  if (!authToken) {
    authToken = await authorize();
    await setex('WEMA:AUTH:TOKEN', authToken, 23 * 60 * 60);
  }
  return authToken;
};

const getBankCall = async (endpoint: string, payload: any): Promise<any> => {
  const response = await axios.get(endpoint, payload);
  return response.data;
};

export const getBankList = async (): Promise<{ name: string; code: string }[]> => {
  const token = await confirmAuth();
  const endpoint = `${WEMA_BANK_BASE_URL}/WMServices/GetNIPBanks`;
  const payload = { headers: { Authorization: `Bearer ${token}`, VendorID: WEMA_VENDOR_ID } };
  // eslint-disable-next-line prettier/prettier
  const errorPayload = { dependency, method: 'GET', school: Settings.get('SCHOOL'), provider: Settings.get('PROVIDERS'), payload, event: 'wema.get.bankList:failure', endpoint };
  const data = await catchIntegrationWithThirdPartyLogs(getBankCall, errorPayload, endpoint, payload);

  const banks = data.map((record: string) => {
    const [name, code] = record.split('|');
    return {
      name: name.trim(),
      code: code.trim(),
    };
  });
  return banks;
};

export const nameEnquiry = async (bankCode: string, accountNumber: string): Promise<string> => {
  if (Utils.isStaging()) return 'OLALEKAN ADEWALE';
  const token = await confirmAuth();

  const nameEnquiryResponse = await axios.post(
    `${WEMA_BANK_BASE_URL}/WMServices/NIPNameEnquiry`,
    {
      nameEnquiryRequest: encrypt({
        myDestinationBankCode: bankCode,
        myDestinationAccountNumber: accountNumber,
      }),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        VendorID: WEMA_VENDOR_ID,
      },
      timeout: 5000,
    },
  );
  const decryptedResponse = decrypt(nameEnquiryResponse.data);
  const [, accountName] = decryptedResponse.split('|');
  return accountName;
};

export const bankTransfer = async (incomingPayload: {
  bankCode: string;
  recipientAccountNumber: string;
  recipientAccountName: string;
  originatorAccountNumber: string;
  originatorAccountName: string;
  narration: string;
  reference: string;
  amount: number;
}): Promise<{ code: string; message: string }> => {
  // if (!Utils.isProd()) return { code: '00', message: '433755213456787654456798765432' };
  const payload = Utils.isProd()
    ? incomingPayload
    : {
        originatorAccountNumber: '1300005957',
        originatorAccountName: 'Olga Best/Randall Aguirre',
        amount: '660000',
        narration: 'For 1st test',
        recipientAccountName: 'SALAMI MURITALA OLAYIWOLA',
        recipientAccountNumber: '0011678314',
        bankCode: '000013',
        reference: incomingPayload.reference,
      };
  const { bankCode, recipientAccountNumber, recipientAccountName, originatorAccountNumber, originatorAccountName, narration, reference, amount } =
    payload;

  const token = await confirmAuth();
  const { data } = await axios.post(
    `${WEMA_BANK_BASE_URL}/WMServices/NIPFundTransfer`,
    {
      FundTransferRequest: encrypt({
        myDestinationBankCode: bankCode,
        myDestinationAccountNumber: recipientAccountNumber,
        myAccountName: recipientAccountName,
        myOriginatorName: originatorAccountName,
        myNarration: narration,
        myPaymentReference: reference,
        myAmount: amount,
        sourceAccountNo: originatorAccountNumber,
      }),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        VendorID: WEMA_VENDOR_ID,
      },
    },
  );
  logger.info(data);

  if (data.code) return { code: data.code, message: data.message };
  const [code, sessionId] = decrypt(data).split('|');

  logger.info(code);

  return { code, message: sessionId };
};

export const requeryTransaction = async (transactionReference: string): Promise<any> => {
  const token = await confirmAuth();
  const encryptedReference = encrypt(transactionReference);
  const { data } = await axios.get(`${WEMA_BANK_BASE_URL}/WMServices/GetTransactionStatus?TransactionReference=${encryptedReference}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      VendorID: WEMA_VENDOR_ID,
    },
  });
  logger.info(data);
  const decryptedData: any = decrypt(data);
  const { TransactionReference, Response, TransactionType, DatePosted } = JSON.parse(decryptedData);
  const [code, sessionId] = Response.split('|');
  return { code, message: sessionId, TransactionType, DatePosted, TransactionReference };
};

export const requeryTransaction2 = async (): Promise<any> => {
  const token = await confirmAuth();
  // const encryptedReference = encrypt(transactionReference);
  console.log('making request');

  const { data } = await axios.post(
    `${WEMA_BANK_BASE_URL}/api/v1/Trans/TransQuery`,
    {
      sessionid: '000017210619202127070427181266',
      craccount: '3046778959',
      amount: 2000,
      txndate: '2021-06-19',
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        VendorID: WEMA_VENDOR_ID,
      },
    },
  );
  logger.info(data);
  return data;
};
