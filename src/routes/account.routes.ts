import express from 'express';
import { beyonicWEBHOOK, flutterWaveWEBHOOK, smileIdWEBHOOK, wemaDepositWEBHOOK, wemaWEBHOOK } from '../controllers/webhook.controller';

const router = express.Router();

router.post('/lookup', wemaWEBHOOK);
router.post('/deposit', wemaDepositWEBHOOK);

export default router;
