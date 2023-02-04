/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { parsePhoneNumber } from 'libphonenumber-js';
import randomstring from 'randomstring';
const dateFns = require('date-fns');

const table_prefix = {
  image: 'im_',
  business: 'bs_',
  cart: 'cr_',
  order: 'or_',
  product: 'pr_',
  transactions: 'tr_',
};

export const jsonify = (payload: any) => {
  try {
    return payload.toJSON();
    // eslint-disable-next-line no-empty
  } catch (error) {}
  return payload;
};

export const findObjectValue = (object: any, path: string) => {
  const args = path.split('.');
  let sanitizedObject = jsonify(object);
  // eslint-disable-next-line no-plusplus
  for (let index = 0; index < args.length; index++) {
    if (!sanitizedObject.hasOwnProperty(args[index])) return;
    sanitizedObject = sanitizedObject[args[index]];
  }
  // eslint-disable-next-line consistent-return
  return sanitizedObject;
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

export const getKeyByValue = (object: { [key: string]: any }, value: string): any => {
  return Object.keys(object).find((key) => object[key] === value);
};

export const percentCalculator = (numerator: number, denominator: number): number => {
  return (numerator / denominator) * 100;
};

export const toString = (value: any): string => {
  return typeof value === 'string' ? value : JSON.stringify(value);
};

export const toTitle = (text: string) => {
  return text && `${text[0].toUpperCase()}${text.substr(1)}`;
};

export const mapAnArray = (arr: any[], key: string) => {
  return arr.map((item) => {
    const response = jsonify(item);
    return key.includes('.') ? findObjectValue(response, key) : response[key];
  });
};

export const createObjectFromArray = (payload: any, key: string, value: any, path: string) => {
  if (!Array.isArray(payload)) return null;
  const response: { [key: string]: any } = {};
  payload.forEach((item) => {
    const data = path ? findObjectValue(item, path) : jsonify(item);
    if (Array.isArray(value)) {
      value.forEach((element) => {
        response[data[key]][element] = data[element];
      });
    } else response[data[key]] = data[value];
  });
  return response;
};

export const maxElementFromAnArray = (arr: any[], key: string) => {
  return arr.reduce((prev, nex) => {
    const previous = jsonify(prev);
    const next = jsonify(nex);
    if (previous[key] > next[key]) {
      return previous;
    }
    return next;
  });
};

export const minElementFromAnArray = (arr: any[], key: string) => {
  if (!arr.length) return null;
  return arr.reduce((prev, nex) => {
    const previous = jsonify(prev);
    const next = jsonify(nex);
    if (previous[key] < next[key]) {
      return previous;
    }
    return next;
  });
};

export const formatAmount = (value: string) => {
  return parseInt(value, 10) / 100;
};

export const getCurrentDate = () => {
  return dateFns.format(new Date(), 'yyyy-MM-dd');
};

export const isValidDate = (date: any): boolean => {
  try {
    if (typeof date === 'string') {
      return dateFns.isValid(new Date(date));
    }
    return dateFns.isValid(date);
  } catch (e) {
    return false;
  }
};
