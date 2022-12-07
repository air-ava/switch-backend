import { parsePhoneNumber } from 'libphonenumber-js';
import randomstring from 'randomstring';

const table_prefix = {
  image: 'im_',
  business: 'bs_',
  cart: 'cr_',
  order: 'or_',
  product: 'pr_',
  transactions: 'tr_',
};

export const formatPhoneNumber = (localFormat: string): string => {
  const { number: newInternationalFormat } = parsePhoneNumber(localFormat, 'NG');
  return newInternationalFormat;
};

export const randomstringGeenerator = (table_type: 'image' | 'business' | 'cart' | 'order' | 'product' | 'transactions'): string => {
  return `${table_prefix[table_type]}${randomstring.generate({ length: 5, capitalization: 'lowercase', charset: 'alphanumeric' })}`;
};

export const sumOfArray = (items: any[], element: string): number => {
  return items.reduce((acc: any, curr: any) => Number(acc) + Number(curr[element]), 0);
};

export const sumOfTwoCoulumnsArray = (items: any[], elementOne: string, elementTwo: string): number => {
  return items.reduce((acc: any, curr: any) => {
    return acc + curr[elementOne] * curr[elementTwo];
  }, 0);
};

export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'NGN',

  // These options are needed to round to whole numbers if that's what you want.
  // minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  // maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

export const statusOfTransaction = (payload: any): boolean => {
  if (payload === 'failed') return false;
  return true;
};
