import express from 'express';

// eslint-disable-next-line prettier/prettier
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { BASE_URL, PORT } from '../utils/secrets';
import { Log, log } from '../utils/logs';

const router = express.Router();

const swaggerConfig = {
  definition: {
    swagger: '2.0',
    info: {
      title: 'PAYSTACK SHOPPING CART',
      version: '1.0.0',
      description: 'To test the shopping Cart Endpoints',
    },
    host: `localhost:${PORT}`,
    basePath: '/',
    schemes: ['http'],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        description: 'Value: Bearer ',
        name: 'Authorization',
        in: 'header',
      },
    },
    security: [
      {
        Bearer: [],
      },
    ],
  },
  apis: ['./**/routes/index.ts', './**/routes/**/*.routes.ts'],
};

const options = {
  explorer: true,
};
const startSwagger = () => {
  log(Log.bg.green, ` Test App with SWAGGER available on: ${BASE_URL}/swagger `);
  return swaggerConfig;
};
const config = startSwagger();

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerJSDoc(config), options));

export default router;
