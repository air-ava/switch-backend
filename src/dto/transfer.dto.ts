import { ControllerResponse } from '../utils/interface';

export interface validateAccountDetailsDTO {
  accountNumber: string;
  bankCode: string;
}

export interface bankTransferDTO {
  bankCode: string;
  recipientAccountNumber: string;
  recipientAccountName: string;
  originatorAccountNumber: string;
  originatorAccountName: string;
  narration: string;
  reference: string;
  amount: number;
}

export type validateAccountDetailsRES = ControllerResponse & { data?: { accountName: string } };
