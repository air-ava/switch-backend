import express from 'express';
import { beyonicWEBHOOK, flutterWaveWEBHOOK, smileIdWEBHOOK } from '../controllers/webhook.controller';

const router = express.Router();

router.post('/flutterwave', flutterWaveWEBHOOK);
router.post('/beyonic', beyonicWEBHOOK);
router.post('/smileId', smileIdWEBHOOK);

export default router;
