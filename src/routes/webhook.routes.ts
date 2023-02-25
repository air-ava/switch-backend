import express from 'express';
import { beyonicWEBHOOK, flutterWaveWEBHOOK } from '../controllers/webhook.controller';

const router = express.Router();

router.post('/flutterwave', flutterWaveWEBHOOK);
router.post('/beyonic', beyonicWEBHOOK);

export default router;
