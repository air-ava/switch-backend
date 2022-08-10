import express from 'express';
import { signUp } from '../controllers/user.controller';

const router = express.Router();

router.post('/register', signUp);
router.post('/login', signUp);

export default router;
