import express from 'express';
import { wemaDepositWEBHOOK, wemaWEBHOOK } from '../../controllers/webhook.controller';
import { catchWebhookErrors, catchWemaWebhookErrors } from '../../utils/errors';
import { wemaMiddleware } from '../../middleware/validation.middleware';

const router = express.Router();

router.use(catchWemaWebhookErrors(wemaMiddleware));
router.post('/lookup', catchWemaWebhookErrors(wemaWEBHOOK));
router.post('/deposit', catchWemaWebhookErrors(wemaDepositWEBHOOK));

export default router;
