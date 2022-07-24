import express from 'express';

// eslint-disable-next-line prettier/prettier
import { AddressCreator, userResource } from './user';
import { validateSession } from './auth';

const router = express.Router();

router.get('/', (_, res) => res.json({ success: true, message: 'User gateway v1 up.' }));

router.post('/user', userResource);
router.use(validateSession);
router.post('/address', AddressCreator);

export default router;
