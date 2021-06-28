/* eslint-disable no-console */
import express, { Application, Request, Response } from 'express';

const app: Application = express();

const port = 3001;

app.get('/toto', (req: Request, res: Response) => {
  res.json({ greeting: `Hello, Good Morning ${port} !` });
});

app.listen(port);

app.on('port', () => {
  console.log(`App is listening on port ${port} !`);
});
