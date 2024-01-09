import { handleUnaryCall } from '@grpc/grpc-js';
import WemaWebhook from '../webhooks/wema.webhook';
import { catchErrorsProto } from '../utils/errors';
import {
  getReservedAccountDTO,
  getReservedAccounRES,
  creditWalletOnReservedAccountDTO,
  creditWalletOnReservedAccountRES,
} from '../dto/reservedAccount.dto';

export const getReservedAccount: handleUnaryCall<getReservedAccountDTO, getReservedAccounRES> = async (call, callback) => {
  try {
    const { reservedAccountNumber } = call.request;

    const response = await catchErrorsProto(WemaWebhook.getReservedAccount, reservedAccountNumber, true);
    return callback(null, response);
  } catch (error: any) {
    return callback(error);
  }
};

export const creditWalletOnReservedAccountFunding: handleUnaryCall<creditWalletOnReservedAccountDTO, creditWalletOnReservedAccountRES> = async (
  call,
  callback,
) => {
  try {
    const {
      amount,
      bankName: bankname,
      bankCode: bankcode,
      sessionId: sessionid,
      reference,
      narration,
      externalReference: paymentreference,
      reservedAccountName: craccountname,
      reservedAccountNumber: craccount,
      originatorAccountName: originatorname,
      originatorAccountNumber: originatoraccountnumber,
    } = call.request;

    console.log({ 'call.request': call.request });

    const response = await catchErrorsProto(
      WemaWebhook.creditWalletOnReservedAccount,
      {
        amount,
        bankname,
        bankcode,
        sessionid,
        reference,
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
    return callback(error);
  }
};
