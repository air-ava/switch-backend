import express from 'express';
import { beyonicWEBHOOK, flutterWaveWEBHOOK, smileIdWEBHOOK, wemaWEBHOOK } from '../controllers/webhook.controller';

const router = express.Router();

router.post('/flutterwave', flutterWaveWEBHOOK);
router.post('/beyonic', beyonicWEBHOOK);
router.post('/smileId', smileIdWEBHOOK);
router.post('/account-lookup', wemaWEBHOOK);

export default router;
