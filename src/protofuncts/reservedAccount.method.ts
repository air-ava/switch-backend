import { handleUnaryCall } from '@grpc/grpc-js';
import WemaWebhook from '../webhooks/wema.webhook';
import { catchErrorsProto } from '../utils/errors';
import {
  getReservedAccountDTO,
  getReservedAccounRES,
  creditWalletOnReservedAccountDTO,
  creditWalletOnReservedAccountRES,
  fetchKYCRES,
} from '../dto/reservedAccount.dto';
import { ControllerResponse } from '../utils/interface';

interface ICreditRes {
  success: boolean;
  error?: string;
  message?: string;
  data: { reference: string };
  school: {
    id: number;
    code: string;
    name: string;
    status: number;
    country: string;
    slug: string;
    organisationId: number;
  };
  reference: string;
}

export const getReservedAccount: handleUnaryCall<getReservedAccountDTO, getReservedAccounRES> = async (call, callback) => {
  try {
    const { reservedAccountNumber } = call.request;

    const response = await catchErrorsProto(WemaWebhook.getReservedAccount, reservedAccountNumber, true);
    return callback(null, response);
  } catch (error: any) {
    return callback(error);
  }
};

export const creditWalletOnReservedAccountFunding: handleUnaryCall<creditWalletOnReservedAccountDTO, ICreditRes> = async (call, callback) => {
  try {
    const {
      amount,
      bankName: bankname,
      bankCode: bankcode,
      sessionId: sessionid,
      reference: incomingReference,
      narration,
      externalReference: paymentreference,
      reservedAccountName: craccountname,
      reservedAccountNumber: craccount,
      originatorAccountName: originatorname,
      originatorAccountNumber: originatoraccountnumber,
    } = call.request;

    const response = await catchErrorsProto(
      WemaWebhook.creditWalletOnReservedAccount,
      {
        amount,
        bankname,
        bankcode,
        sessionid,
        reference: incomingReference,
        narration,
        paymentreference,
        craccountname,
        craccount,
        originatorname,
        originatoraccountnumber,
      },
      true,
    );

    console.log({ response });
    return callback(null, response);
  } catch (error: any) {
    console.log({ error });
    return callback(error);
  }
};

export const blockReservedAccount: handleUnaryCall<{ accountnumber: string; blockreason: string }, ControllerResponse> = async (call, callback) => {
  try {
    const { accountnumber, blockreason } = call.request;

    const response = await catchErrorsProto(WemaWebhook.blockAccount, { accountnumber, blockreason });

    console.log({ response });
    return callback(null, response);
  } catch (error: any) {
    console.log({ error });
    return callback(error);
  }
};

export const fetchAccountKYC: handleUnaryCall<{ accountnumber: string; blockreason: string }, fetchKYCRES> = async (call, callback) => {
  try {
    const { accountnumber } = call.request;
    const response = await catchErrorsProto(WemaWebhook.fetchAccountKYC, { accountnumber });

    console.log({ response });
    return callback(null, response);
  } catch (error: any) {
    console.log({ error });
    return callback(error);
  }
};

export const fetchMiniStatement: handleUnaryCall<{ accountnumber: string; blockreason: string }, fetchKYCRES> = async (call, callback) => {
  try {
    const { accountnumber } = call.request;
    const response = await catchErrorsProto(WemaWebhook.fetchMiniStatement, { accountnumber });

    return callback(null, response);
  } catch (error: any) {
    console.log({ error });
    return callback(error);
  }
};
