import jwt, { SignOptions, sign } from 'jsonwebtoken';
import { JWT_KEY, WEMA_ACCOUNT_PREFIX } from './secrets';
import { ControllResponse } from './interface';

export function signToken(payload: string | Record<string, string>, key: string): string {
  return jwt.sign(payload, key);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function generateToken(data: any) {
  // information to be encoded in the JWT
  const { first_name, id: userId } = data;
  const payload = {
    first_name,
    type: 'user',
    userId,
    accessTypes: ['getTeams', 'addTeams', 'updateTeams', 'deleteTeams'],
  };
  // read private key value
  // const privateKey = fs.readFileSync(path.join(__dirname, './../../../private.key'));

  const signInOptions: SignOptions = {
    // RS256 uses a public/private key pair. The API provides the private key
    // to generate the JWT. The client gets a public key to validate the
    // signature
    // algorithm: 'RS256',
    expiresIn: '1h',
  };

  // generate JWT
  return sign(payload, JWT_KEY, signInOptions);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function generateBackOfficeToken(data: any) {
  // information to be encoded in the JWT
  const { name, id: userId } = data;
  const payload = {
    name,
    type: 'backOffice',
    userId,
    accessTypes: ['getTeams', 'addTeams', 'updateTeams', 'deleteTeams'],
  };
  const signInOptions: SignOptions = {
    expiresIn: '1h',
  };

  // generate JWT
  return sign(payload, JWT_KEY, signInOptions);
}

export function generateGuardianToken(data: any) {
  // information to be encoded in the JWT
  const { id: userId } = data;
  const payload = {
    first_name: data.Guardian.firstName,
    type: 'guardian',
    userId,
    accessTypes: ['getTeams', 'addTeams', 'updateTeams', 'deleteTeams'],
  };
  const signInOptions: SignOptions = {
    expiresIn: '1h',
  };

  // generate JWT
  return sign(payload, JWT_KEY, signInOptions);
}

export function generateWemaToken() {
  const payload = {
    merchant_prefix: '960' || WEMA_ACCOUNT_PREFIX,
    type: 'wema',
    environment: 'PRODUCTION',
  };
  // generate JWT
  return sign(payload, JWT_KEY);
}

export function decodeToken(token: string, key: string): ControllResponse & { data?: any }{
  try {
    const data: any = jwt.verify(token, key);
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return { success: false, error: (error.message === 'jwt must be provided' && error.message) || 'Invalid or expired token provided.' };
  }
}
