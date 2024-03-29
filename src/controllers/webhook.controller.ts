import { RequestHandler } from 'express';
import logger from '../utils/logger';
import { bayonicWebhookHandler } from '../webhooks/beyonic.webhook';
import { completeTransaction } from '../webhooks/flutterwave.webhook';
import SmileIdWebhook from '../webhooks/smileId.webhook';
import WemaWebhook from '../webhooks/wema.webhook';
import ResponseService from '../utils/response';
import { STEWARD_BASE_URL } from '../utils/secrets';
import { saveThirdPartyLogsREPO } from '../database/repositories/thirdParty.repo';

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

export const beyonicWEBHOOK: RequestHandler = async (req, res): Promise<void> => {
  try {
    // logger.info(req.body);
    const response = await bayonicWebhookHandler(req.body);
    res.status(200).json({ success: true, message: 'OK', data: response }).end();
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: false, error }).end();
  }
};

export const smileIdWEBHOOK: RequestHandler = async (req, res): Promise<void> => {
  try {
    // logger.info(req.body);
    ResponseService.success(res, 'OK');
    await SmileIdWebhook.basicKycResponseNew(req.body);
    // await SmileIdWebhook.basicKycResponse(req.body);
  } catch (error) {
    res.status(200).json({ success: false, error }).end();
  }
};

export const wemaWEBHOOK: RequestHandler = async (req, res): Promise<void> => {
  logger.info(req.body);
  const response = await WemaWebhook.verifyAccountNumber(req.body);
  const { status, status_desc, ...rest } = response;
  ResponseService.wemaSuccess(res, status, status_desc, rest);
};

export const wemaDepositWEBHOOK: RequestHandler = async (req, res): Promise<void> => {
  // logger.info(req.body);
  const response = await WemaWebhook.incomingDeposit(req.body);
  const { status, status_desc, ...rest } = response;
  ResponseService.wemaSuccess(res, status, status_desc, rest);
};
