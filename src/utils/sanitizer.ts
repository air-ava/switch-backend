/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IBusiness, IPhoneNumber, IUser } from '../database/modelInterfaces';

export const jsonify = (payload: any): { [key: string]: any } => {
  try {
    return payload.toJSON();
    // eslint-disable-next-line no-empty
  } catch (e) {}
  return payload;
};

export const sanitizePhoneNumber = (payload: IPhoneNumber): any => {
  if (!payload) return null;
  const { id, ...rest } = jsonify(payload);
  return rest;
};

export const sanitizePhoneNumbers = (payload: any): any => {
  if (!Array.isArray(payload)) return [];
  return payload.map(sanitizePhoneNumber);
};

export const sanitizeUser = (payload: IUser): any => {
  if (!payload) return null;
  const { id, password, phone_number, remember_token, phoneNumber, ...rest } = jsonify(payload);
  const sanitized = {
    ...rest,
    ...(phoneNumber && { phone_number: phoneNumber.internationalFormat }),
    phoneNumber: sanitizePhoneNumber(phoneNumber),
  };
  return sanitized;
};

export const sanitizeUsers = (payload: any): any => {
  if (!Array.isArray(payload)) return null;
  return payload.map(sanitizeUser);
};

export const sanitizeBusiness = (payload: IBusiness): any => {
  if (!payload) return null;
  const { id, phone_number, phone, owners, ...rest } = jsonify(payload);
  const sanitized = {
    ...rest,
    ...(phone && { phone_number: phone.internationalFormat }),
    ...(phone && { phone: sanitizePhoneNumber(phone) }),
    ...(owners && { owner: sanitizeUser(owners) }),
  };
  return sanitized;
};

export const sanitizeBusinesses = (payload: any): any => {
  if (!Array.isArray(payload)) return null;
  return payload.map(sanitizeBusiness);
};
