import express from 'express';

// eslint-disable-next-line prettier/prettier
// import { userResource } from '../controllers/user.controller';
import authRouter from './auth.routes';
import { validateSession } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', (_, res) => res.json({ success: true, message: 'User gateway v1 up.' }));

router.post('/auth', authRouter);
router.use(validateSession);

export default router;
