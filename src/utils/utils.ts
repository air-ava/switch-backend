/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { parsePhoneNumber } from 'libphonenumber-js';
import randomstring from 'randomstring';
import { MoreThan, LessThan, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ENVIRONMENT } from './secrets';
import ValidationError from './validationError';

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
    if (!Object.prototype.hasOwnProperty.call(sanitizedObject, args[index])) return;
    sanitizedObject = sanitizedObject[args[index]];
  }
  // eslint-disable-next-line consistent-return
  return sanitizedObject;
};

export const formatPhoneNumber = (localFormat: string): string => {
  const { number: newInternationalFormat } = parsePhoneNumber(localFormat, 'UG');
  return newInternationalFormat;
};

export const randomstringGeenerator = (table_type: 'image' | 'business' | 'cart' | 'order' | 'product' | 'transactions'): string => {
  return `${table_prefix[table_type]}${randomstring.generate({ length: 5, capitalization: 'lowercase', charset: 'alphanumeric' })}`;
};

export const sumOfArray = (items: any[], element: string): number => {
  return items.reduce((acc: any, curr: any) => Number(acc) + Number(curr[element]), 0);
};

export const sumAnArrayOfNumbers = (items: any[]): number => {
  return items.reduce((acc: any, curr: any) => Number(acc) + Number(curr), 0);
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

export const createObjectFromArray = (payload: any, key: string, value: any, path?: string) => {
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

export const createObjectFromArrayWithoutValue = (arr: any, key1: string, key2?: string) => {
  return arr.reduce((result: any, item: any) => {
    const response = jsonify(item);
    const keyValue1 = key1.includes('.') ? findObjectValue(item, key1) : response[key1];
    const keyValue2 = key2 && (key2.includes('.') ? findObjectValue(item, key2) : response[key2]);
    const combinedKey = `${keyValue1}${key2 ? ` | ${keyValue2}` : ''}`;
    if (!result[combinedKey]) {
      // eslint-disable-next-line no-param-reassign
      result[combinedKey] = [];
    }
    result[combinedKey].push(item);
    return result;
  }, {});
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

export const singleDayStartAndEnd = (date: any = new Date()): { startDate: Date; endDate: Date } => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
};

const Utils = {
  isProd() {
    return ENVIRONMENT === 'production';
  },

  isTest() {
    return ENVIRONMENT === 'test';
  },

  isStaging() {
    return ['development', 'staging', 'local'].includes(ENVIRONMENT);
  },

  isLive() {
    return ['production', 'test'].includes(ENVIRONMENT);
  },

  getApiURL() {
    return Utils.isProd() ? `https://steward-prod-rmq4b.ondigitalocean.app` : `https://king-prawn-app-ovupz.ondigitalocean.app`;
  },

  getMoMoURL() {
    return Utils.isProd() ? `https://sandbox.momodeveloper.mtn.com` : `https://sandbox.momodeveloper.mtn.com`;
  },

  getWebhookURL(view = false) {
    return Utils.isProd()
      ? `https://steward-prod-rmq4b.ondigitalocean.app/webhook/beyonic`
      : `${view ? 'https://webhook.site/6c055143-7e7f-416b-9247-a72e220c48a6' : 'https://king-prawn-app-ovupz.ondigitalocean.app/webhook/beyonic'}`;
  },

  getMoMoCollectionKey() {
    return Utils.isProd() ? `febc3f760f6643a8ab7dc6db7c9656cb` : `b613cffce55b4422bc03fde213efa160`;
  },

  getMoMoCollectionWidgetKey() {
    return Utils.isProd() ? `3df959f0ea46451583d67c087f03d6d0` : `f8a2c767ff044a09b854b5ba312a2873`;
  },

  getMoMoDisbursementKey() {
    return Utils.isProd() ? `71eb435db4ee4738a22446fe6eafdbbc` : `1590ffcb20dd4b0db830562f1d99d90d`;
  },

  getMoMoAuth() {
    return Utils.isProd()
      ? {
          userReferenceId: `30293133-188e-41f8-a65c-433c321c1ae2`,
          apiKey: 'b3e3e99adbc54225bcc523af01ee1021',
          targetEnironment: `production`,
        }
      : {
          userReferenceId: `30293133-188e-41f8-a65c-433c321c1ae2`,
          apiKey: 'b3e3e99adbc54225bcc523af01ee1021',
          targetEnironment: `sandbox`,
        };
  },

  getMoMoProductKeys() {
    return Utils.isProd()
      ? {
          collection: `febc3f760f6643a8ab7dc6db7c9656cb`,
          collectionWidget: '3df959f0ea46451583d67c087f03d6d0',
          disbursement: `71eb435db4ee4738a22446fe6eafdbbc`,
        }
      : {
          collection: `b613cffce55b4422bc03fde213efa160`,
          collectionWidget: 'f8a2c767ff044a09b854b5ba312a2873',
          disbursement: `1590ffcb20dd4b0db830562f1d99d90d`,
        };
  },

  getCurrentDate() {
    return dateFns.format(new Date(), 'yyyy-MM-dd');
  },

  firstDateIsBeforeSecondDate(firstDate: Date, secondDate = new Date()) {
    return dateFns.isBefore(firstDate, secondDate);
  },

  firstDateIsAfterSecondDate(firstDate: Date, secondDate = new Date()) {
    return dateFns.isAfter(firstDate, secondDate);
  },

  isWithinInterval(dateToCheck: Date, firstDate: Date, secondDate = new Date()) {
    return dateFns.isWithinInterval(dateToCheck, {
      start: firstDate,
      end: secondDate,
    });
  },

  isDateToday(date: Date) {
    return dateFns.isToday(new Date(date));
  },

  isDateTomorrow(date: Date) {
    return dateFns.isTomorrow(new Date(date));
  },

  addDays(date: Date, daysCount: number) {
    return dateFns.addDays(new Date(date), daysCount);
  },

  isSameDay(firstDate: Date, secondDate: Date) {
    return dateFns.isSameDay(firstDate, secondDate);
  },

  parseISO(date: Date) {
    return dateFns.parseISO(date);
  },

  getUniqueNonRepeatedElements(firstArray: string[] = [], secondArray: string[] = []): string[] {
    return firstArray
      .filter((element) => !secondArray.includes(element)) // filtering out elements present in secondArray
      .concat(secondArray.filter((element) => !firstArray.includes(element))); // Concatenate elements from secondArray not present in firstArray
  },

  getUniqueElements(firstArray: string[] = [], secondArray: string[] = []): string[] {
    const concatenatedArray = firstArray.concat(secondArray);
    return [...new Set(concatenatedArray)];
  },

  paginationOrderAndCursor(cursor: number, query: any): any {
    const order: any = { created_at: 'DESC' };
    // eslint-disable-next-line no-param-reassign
    if (cursor) query.id = order.created_at === 'ASC' ? MoreThan(cursor) : LessThan(cursor);
    return { order, query, cursor };
  },

  paginationMetaCursor(data: any): any {
    const { responseArray, perPage, cursor } = data;
    const hasMore = responseArray.length === Number(perPage);
    const newCursor = hasMore ? responseArray[perPage - 1].id : null;
    const previousCursor = cursor && responseArray.length ? responseArray[0].id : null;
    return { hasMore, newCursor, previousCursor };
  },

  paginationRangeAndOffset(data: { page: number; perPage: number; from: any; to: any; query: any }): any {
    const { page, from, to, perPage, query } = data;
    const offset = (page - 1) * perPage;
    // const order: any = { created_at: 'DESC' };
    if (from && to) {
      query.created_at = Between(from, to);
    } else if (from) {
      query.created_at = MoreThanOrEqual(from);
    } else if (to) {
      query.created_at = LessThanOrEqual(to);
    }
    return { offset, query };
  },

  paginationMetaOffset(data: any): any {
    const { total, perPage, page } = data;
    const totalPages = Math.ceil(total / perPage);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    const nextPage = hasNextPage ? Number(page) + 1 : null;
    return { nextPage, totalPages, hasNextPage, hasPreviousPage };
  },

  formatAndUpdatePhoneNumber(phone: string): string {
    // eslint-disable-next-line prefer-const
    let customRegex = /^\+\d{1,3}\d{3,}$/;
    phone = phone.replace(/\D/g, '');
    if (!phone.startsWith('+')) phone = `+${phone}`;
    if (!customRegex.test(phone)) throw new ValidationError('Invalid Phone Number');
    return phone;
  },

  limitAndAddEllipsis(inputString: string, maxLength = 30) {
    if (inputString.length <= maxLength) {
      return inputString; // Return the original string if it's within or equal to the limit
    }
    return `${inputString.slice(0, maxLength - 3)}...`; // Truncate and add ellipsis
  },

  removeStringWhiteSpace(string: string): string {
    if (typeof string !== 'string') throw new ValidationError('Wrong data type passed');
    return string.replace(/\s/g, '');
  },

  isFalsyOrUnknown(value: any) {
    return !value || value === 'unknown';
  },
};

export default Utils;
