import forge from 'node-forge';

import { FLUTTERWAVE_ENCRYPTION_KEY } from '../../utils/secrets';

export function encrypt(text: string): string {
  const cipher = forge.cipher.createCipher('3DES-ECB', forge.util.createBuffer(FLUTTERWAVE_ENCRYPTION_KEY));
  cipher.start({ iv: '' });
  cipher.update(forge.util.createBuffer(text, 'utf8'));
  cipher.finish();
  const encrypted = cipher.output;
  return forge.util.encode64(encrypted.getBytes());
}
export function decrypt(request: string): string {
  const decipher = forge.cipher.createDecipher('3DES-ECB', FLUTTERWAVE_ENCRYPTION_KEY);
  decipher.start({ iv: '' });
  decipher.update(forge.util.createBuffer(Buffer.from(request, 'base64').toString('binary')));
  const finish = decipher.finish();
  if (!finish) throw new Error('Unable to decrypt payload');
  return decipher.output.getBytes();
}
