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

export interface creditWalletOnReservedAccountDTO {
  amount: string;
  bankName: string;
  bankCode: string;
  sessionId: string;
  reference: string;
  narration: string;
  externalReference: string;
  reservedAccountName: string;
  reservedAccountNumber: string;
  originatorAccountName: string;
  originatorAccountNumber: string;
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

export type creditWalletOnReservedAccountRES = ControllerResponse & {
  school?: {
    id: number;
    code: string;
    name: string;
    status: number;
    country: string;
    slug: string;
    organisationId: number;
  };
  reference?: string;
};

export type fetchKYCRES = ControllerResponse & {
  data?: {
    accountname: string;
    BVN: string;
    walletbalance: string;
    mobilenumber: string;
    status_desc: string;
  };
};
export type fetchMiniStatementRES = ControllerResponse & {
  data?: {
    amount: string;
    accountNo: string;
    bankName: string;
    direction: string;
    transactiondate: string;
  }[];
};
