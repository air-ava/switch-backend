import { IUser, ISchools } from '../database/modelInterfaces';
import { ControllerResponse } from '../utils/interface';

export interface assignAccountNumberDTO {
  holder: 'student' | 'school';
  holderId: string;
  user?: IUser;
  school: ISchools;
}

export interface creditWalletOnReservedAccountFundingDTO {
  originator_account_number: string;
  amount: number;
  originator_account_name: string;
  narration: string;
  reserved_account_name: string;
  reserved_account_number: string;
  external_reference: string;
  session_id: string;
  reference: string;
  bank_name: string;
  bank_code: string;
  amountInKobo?: boolean;
  processor?: string;
}

export type getReservedAccountDTO = {
  reservedAccountNumber: string;
};

export type getReservedAccounRES = ControllerResponse & {
  data?: {
    reservedAccountName: string;
    id: number;
  };
};
