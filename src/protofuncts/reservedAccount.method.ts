import { handleUnaryCall } from '@grpc/grpc-js';
import WemaWebhook from '../webhooks/wema.webhook';
import { catchErrorsProto } from '../utils/errors';
import {
  getReservedAccountDTO,
  getReservedAccounRES,
  creditWalletOnReservedAccountDTO,
  creditWalletOnReservedAccountRES,
} from '../dto/reservedAccount.dto';

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
