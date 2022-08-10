import express from 'express';

// eslint-disable-next-line prettier/prettier
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { PORT } from '../utils/secrets';

const router = express.Router();

const swaggerConfig = {
  definition: {
    info: {
      title: 'PAYSTACK SHOPPING CART',
      version: '1.0.0',
      description: 'To test the shopping Cart Endpoints',
      host: `localhost:${PORT}`,
      basePath: '/',
    },
  },
  //   swaggerDefinition,
  apis: ['./**/routes/index.ts', './**/routes/**.routes.ts'],
};

const options = {
  explorer: true,
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerJSDoc(swaggerConfig), options));

export default router;
