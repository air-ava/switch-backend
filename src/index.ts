/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import express, { Application, NextFunction, Request, Response } from 'express';
import * as grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { createConnection } from 'typeorm';

import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import useragent from 'express-useragent';

import Settings from './services/settings.service';
import logger from './utils/logger';
import router from './routes/api';
import office from './routes/office/index';
import webhook from './routes/webhook.routes';
import ussd from './routes/ussd.routes';
import jobs from './routes/jobs';
import guardian from './routes/guardian';
import { PORT, BASE_URL, PROTO_LOCATION, SERVICE_IP, SERVICE_PORT } from './utils/secrets';
import { Log, log } from './utils/logs';
import Methods from "./protofuncts";

dotenv.config();
const port = PORT || '3000';

const packageDefinition = loadSync(`${PROTO_LOCATION}/core.proto`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pkg = grpc.loadPackageDefinition(packageDefinition).core as any;

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
  });
}

async function startGrpcServer(): Promise<void> {
  const server = new grpc.Server();
  server.addService(pkg.Core.service, Methods);
  server.bindAsync(`${SERVICE_IP}:${SERVICE_PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    logger.info(`Service started successfully on ${SERVICE_IP}:${SERVICE_PORT}`);
  });
}


startServer();
startGrpcServer();
