import express from 'express';

// eslint-disable-next-line prettier/prettier
import authRouter from './auth.routes';
import { validateSession } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', (_, res) => res.json({ success: true, message: 'User gateway v1 up.' }));

router.use('/auth', authRouter);
router.use(validateSession);

export default router;
