import express, { Request, Response } from 'express';

// eslint-disable-next-line prettier/prettier
import authRouter from './auth.guardian.routes';
import schoolRouter from './school.guardian.routes';
import studentRouter from './student.guardian.routes';
import feesRouter from './fees.guardian.routes';
import sessionRouter from './session.guardian.routes';
import paymentsRouter from './payment.guardian.routes';
import { validateSession } from '../../middleware/auth.middleware';
// import Settings from '../services/settings.service';

const router = express.Router();

router.get('/', (_, res) => res.json({ success: true, message: 'Steward User Admin gateway v1 up.' }));

router.use('/auth', authRouter);
router.use(validateSession);
router.use('/payments', paymentsRouter);
router.use('/schools', schoolRouter);
router.use('/students', studentRouter);
router.use('/sessions', sessionRouter);
router.use('/fees', feesRouter);

export default router;
