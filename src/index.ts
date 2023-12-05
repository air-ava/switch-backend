/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import express, { Application, NextFunction, Request, Response } from 'express';
import { createConnection } from 'typeorm';

import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import useragent from 'express-useragent';

import Settings from './services/settings.service';
// import { jsonify } from './utils/sanitizer';
// import User from './database/models/user.entity';
// import { getOneUser } from './database/repositories/user.repository';
import logger from './utils/logger';
import router from './routes/api';
import office from './routes/office/index';
import webhook from './routes/webhook.routes';
import ussd from './routes/ussd.routes';
import jobs from './routes/jobs';
import guardian from './routes/guardian';
import { PORT, BASE_URL } from './utils/secrets';
import { Log, log } from './utils/logs';


dotenv.config();
const port = PORT || '3000';

async function startServer(): Promise<void> {
  const app: Application = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(cors());
  app.use(helmet());

  app.use(useragent.express());

  Sentry.init({
    dsn: 'https://d7b765cb23d0096fae82850121ae4e55@o4506099415580672.ingest.sentry.io/4506099419971584',
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      new ProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });
  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());

  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

  app.use('/api', router);
  app.use('/office', office);
  app.use('/webhook', webhook);
  app.use('/ussd', ussd);
  app.use('/jobs', jobs);
  app.use('/guardians', guardian);

  app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
  });
  

  app.use(Sentry.Handlers.errorHandler());


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
      data: err,
    });
  });

  await createConnection()
    .then(() => logger.info('Database connected'))
    .catch((err) => {
      logger.error('Database connection failed');
      logger.error(JSON.stringify(err));
      console.log({ err });

      process.exit(1);
    });

  app.listen(port, async () => {
    logger.info(`App is listening on port ${port} !`);
    Settings.init();
    // eslint-disable-next-line import/no-named-as-default-member
    // const newUser = await getOneUser({ queryParams: { id: '43e5f477-9541-42dc-8d93-cd025a7d2959' } });
    // console.log({newUser: jsonify(newUser)})
  });

}

startServer();
