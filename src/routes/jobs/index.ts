import express, { Request, Response } from 'express';
import { catchErrors } from '../../utils/errors';
import { cronMiddleware } from '../../middleware/validation.middleware';
import testRouter from './testing.jobs.routes';

const router = express.Router();

router.get('/', (_, res) => res.json({ success: true, message: 'Cron Jobs gateway v1 up.' }));

router.use(catchErrors(cronMiddleware));
router.use('/testing', testRouter);

export default router;
