import express from 'express';
import { flutterWaveWEBHOOK } from '../controllers/webhook.controller';

const router = express.Router();

router.post('/flutterwave', flutterWaveWEBHOOK);

export default router;
