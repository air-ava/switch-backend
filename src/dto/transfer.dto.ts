import { ControllerResponse } from '../utils/interface';

export interface validateAccountDetailsDTO {
  accountNumber: string;
  bankCode: string;
}

export type validateAccountDetailsRES = ControllerResponse & { data?: { accountName: string } };
