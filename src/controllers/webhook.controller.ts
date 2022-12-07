import { RequestHandler } from 'express';
import logger from '../utils/logger';
import { completeTransaction } from '../webhooks/flutterwave.webhook';

export const flutterWaveWEBHOOK: RequestHandler = async (req, res): Promise<void> => {
  try {
    logger.info(req.body);
    const response = await completeTransaction(req.body);
    res.status(200).json({ success: true, message: 'OK', data: response }).end();
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, error }).end();
  }
};