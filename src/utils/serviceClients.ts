/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/first */
import dotenv from 'dotenv';
import caller from 'grpc-caller';

dotenv.config();

import { PROTO_LOCATION, PAYMENTS_SERVICE_IP, PAYMENTS_SERVICE_PORT } from './secrets';

export const paymentsRPC = caller(`${PAYMENTS_SERVICE_IP}:${PAYMENTS_SERVICE_PORT}`, PROTO_LOCATION, 'Payments');
