import express from 'express';

import { userResource } from './user';
// import { validateSession } from './auth';

const router = express.Router();

router.get('/', (_, res) => res.json({ success: true, message: 'User gateway v1 up.' }));

// router.use(validateSession);
router.post('/user', userResource);

export default router;
