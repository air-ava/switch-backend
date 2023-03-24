import jwt, { SignOptions, sign } from 'jsonwebtoken';
import { JWT_KEY } from './secrets';

export function signToken(payload: string | Record<string, string>, key: string): string {
  return jwt.sign(payload, key);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function generateToken(data: any) {
  // information to be encoded in the JWT
  const { first_name, id: userId } = data;
  const payload = {
    first_name,
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

export function decodeToken(token: string, key: string): { success: boolean } {
  try {
    jwt.verify(token, key);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
