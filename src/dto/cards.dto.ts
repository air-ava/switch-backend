import { IUser } from '../database/modelInterfaces';
import { ControllerResponse } from '../utils/interface';

export interface IChargeCard {
  cardNumber: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
  currency?: string;
  amount: number;
  email: string;
  name: string;
  redirectUrl: string;
  pin?: string;
  reference?: string;
  metadata?: any;
}

export interface initiateChargeToSaveReq {
  user_id: string;
  cardNumber: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
  amount: number;
  email: string;
  name: string;
  redirectUrl: string;
  pin: string;
  reference: string;
  currency?: string;
}

export interface verifyWebhookChargeReq {
  transactionId: string;
  user_id: string;
}

export interface validateChargeReq {
  user_id: string;
  reference: string;
  otp: string;
}

export type validateChargeRes = ControllerResponse & {
  data?: {
    reference: string;
  };
};

export interface fundFromSavedCardReq {
  user_id: string;
  userEmail: string;
  amount: number;
  cardId: number;
  password?: string;
  currency?: string;
  user: IUser;
}
