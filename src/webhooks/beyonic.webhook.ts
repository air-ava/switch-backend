import { recordFLWWebhook, verifyChargeFromWebhook } from '../services/cards.service';
import { theResponse } from '../utils/interface';
import logger from '../utils/logger';

export const completeCollectionRequest = async (payload: any): Promise<any> => {
  try {
    // It's a good idea to log all received events.
    // logger.info(payload);
    console.log({
      payload,
      "payload['hook.event']": payload.hook.event,
    });

    let postmanRes;
    // WEBHOOK FOR CARD_TRANSACTION
    // if (payload.event === 'charge.completed' && payload['event.type'] === 'CARD_TRANSACTION') {
    if (payload.hook.event === 'collectionrequest.status.changed') {
      const response = await recordFLWWebhook(payload.data);
      postmanRes = response;
      // logger.info(response);
    }

    return postmanRes;
  } catch (error: any) {
    console.log(error);
    throw error;
  }
};

export const completeCollection = async (payload: any): Promise<any> => {
  try {
    // It's a good idea to log all received events.
    // logger.info(payload);
    console.log({
      payload,
      "payload['hook.event']": payload.hook.event,
    });

    let postmanRes;
    // WEBHOOK FOR CARD_TRANSACTION
    // if (payload.event === 'charge.completed' && payload['event.type'] === 'CARD_TRANSACTION') {
    if (payload.hook.event === 'collectionrequest.status.changed') {
      const response = await recordFLWWebhook(payload.data);
      postmanRes = response;
      // logger.info(response);
    }

    return postmanRes;
  } catch (error: any) {
    console.log(error);
    throw error;
  }
};

export const completeContactCreation = async (payload: any): Promise<any> => {
  try {
    // It's a good idea to log all received events.
    // logger.info(payload);
    console.log({
      payload,
      "payload['hook.event']": payload.hook.event,
    });

    let postmanRes;
    // WEBHOOK FOR CARD_TRANSACTION
    // if (payload.event === 'charge.completed' && payload['event.type'] === 'CARD_TRANSACTION') {
    if (payload.hook.event === 'collectionrequest.status.changed') {
      const response = await recordFLWWebhook(payload.data);
      postmanRes = response;
      // logger.info(response);
    }

    return postmanRes;
  } catch (error: any) {
    console.log(error);
    throw error;
  }
};

export async function bayonicWebhookHandler(payload: any): Promise<any> {
  const { event } = payload.hook;
  switch (event) {
    case 'contact.created':
      await completeContactCreation(payload.data);
      break;
    case 'collectionrequest.status.changed':
      await completeCollectionRequest(payload.data);
      break;
    case 'collection.received':
      await completeCollection(payload.data);
      break;
    default:
      break;
  }
}
