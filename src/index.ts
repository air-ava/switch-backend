/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';

import logger from './utils/logger';
import router from './routes';

const app: Application = express();
app.use(cors());

const port = 3001;

app.use('/v1', router);

app.get('/toto', (req: Request, res: Response) => {
  res.json({ greeting: `Hello, Good Morning ${port} !` });
});

app.use((req, res, _next): void => {
  res.status(404).send({
    status: false,
    error: 'resource not found',
  });
});

// handle unexpected errors
app.use((err: any, req: Request, res: Response, _next: NextFunction): void => {
  res.status(err.status || 500).send({
    success: false,
    error: 'Internal server error.',
  });
});

app.listen(port, () => {
  logger.info(`App is listening on port ${port} !`);
});
