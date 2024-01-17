import { notifySlack } from './notification.method';
import { getReservedAccount, creditWalletOnReservedAccountFunding } from './reservedAccount.method';

const Methods = {
  notifySlack,
  getReservedAccount,
  creditWalletOnReservedAccountFunding,
};

export default Methods;
