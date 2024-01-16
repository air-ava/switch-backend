import { ControllerResponse } from '../utils/interface';

export interface validateAccountDetailsDTO {
  accountNumber: string;
  bankCode: string;
}

export interface bankTransferDTO {
  bankCode: string;
  recipientAccountNumber: string;
  recipientAccountName: string;
  senderAccountNumber: string;
  senderAccountName: string;
  narration: string;
  reference: string;
  transactionPin: string;
  amount: number;
  note?: string;
}

export type validateAccountDetailsRES = ControllerResponse & { data?: { accountName: string } };
