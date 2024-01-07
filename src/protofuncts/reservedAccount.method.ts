import { handleUnaryCall } from '@grpc/grpc-js';
import WemaWebhook from '../webhooks/wema.webhook';
import { catchErrorsProto } from '../utils/errors';
import { getReservedAccountDTO, getReservedAccounRES } from '../dto/reservedAccount.dto';

export const getReservedAccount: handleUnaryCall<getReservedAccountDTO, getReservedAccounRES> = async (call, callback) => {
  try {
    const { reservedAccountNumber } = call.request;

    const response = await catchErrorsProto(WemaWebhook.getReservedAccount, reservedAccountNumber, true);
    return callback(null, response);
  } catch (error: any) {
    return callback(error);
  }
};
