import { AES, enc, mode } from 'crypto-js';
import { WEMA_ENCRYPTION_IV, WEMA_ENCRYPTION_KEY } from '../../utils/secrets';

export const encrypt = (payload: { [key: string]: number | string } | string): string => {
  const processedPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return AES.encrypt(processedPayload, enc.Latin1.parse(WEMA_ENCRYPTION_KEY), {
    iv: enc.Latin1.parse(WEMA_ENCRYPTION_IV),
    mode: mode.CBC,
  }).toString();
};

export const decrypt = (payload: string): string => {
  const decryptedText = AES.decrypt(payload, enc.Latin1.parse(WEMA_ENCRYPTION_KEY), {
    iv: enc.Latin1.parse(WEMA_ENCRYPTION_IV),
    mode: mode.CBC,
  });
  return decryptedText.toString(enc.Utf8);
};
