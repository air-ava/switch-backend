import express from 'express';
import { beyonicWEBHOOK, flutterWaveWEBHOOK, smileIdWEBHOOK, wemaWEBHOOK } from '../../controllers/webhook.controller';
import accountRoutes from './wema.routes';

const router = express.Router();

router.post('/flutterwave', flutterWaveWEBHOOK);
router.post('/beyonic', beyonicWEBHOOK);
router.post('/smileId', smileIdWEBHOOK);

router.use('/wema', accountRoutes);

export default router;
