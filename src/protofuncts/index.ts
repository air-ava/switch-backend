import { notifySlack } from './notification.method';
import {
  getReservedAccount,
  creditWalletOnReservedAccountFunding,
  blockReservedAccount,
  fetchAccountKYC,
  fetchMiniStatement,
} from './reservedAccount.method';

const Methods = {
  notifySlack,
  fetchAccountKYC,
  fetchMiniStatement,
  getReservedAccount,
  blockReservedAccount,
  creditWalletOnReservedAccountFunding,
};

export default Methods;
