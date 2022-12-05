import { verifyChargeFromWebhook } from '../services/cards.service';
import { theResponse } from '../utils/interface';
import logger from '../utils/logger';

export const completeTransaction = async (payload: any): Promise<any> => {
  try {
    // It's a good idea to log all received events.
    logger.info(payload);

    let postmanRes;
    // WEBHOOK FOR CARD_TRANSACTION
    if (payload.event === 'charge.completed' && payload['event.type'] === 'CARD_TRANSACTION') {
      const response = await verifyChargeFromWebhook(payload.data);
      postmanRes = response;
      logger.info(response);
    }

    return postmanRes;
  } catch (error: any) {
    console.log(error);
    throw error;
  }
};
