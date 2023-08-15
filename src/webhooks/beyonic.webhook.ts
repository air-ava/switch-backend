import { Metadata } from 'libphonenumber-js';
import { saveThirdPartyLogsREPO } from '../database/repositories/thirdParty.repo';
import { recordFLWWebhook, verifyChargeFromWebhook } from '../services/cards.service';
import MobileMoneyService, { bayonicCollectionHandler, bayonicPaymentHandler } from '../services/mobileMoney.service';
import { theResponse } from '../utils/interface';
import logger from '../utils/logger';
import { STEWARD_BASE_URL } from '../utils/secrets';

export const completeCollectionRequest = async (payload: any): Promise<any> => {
  try {
    await bayonicCollectionHandler(payload);
  } catch (error: any) {
    console.log(error);
    throw error;
  }
};

export const completeCollection = async (payload: any): Promise<any> => {
  try {
    console.log(payload);
    const { id: collectionId, collection_request, status: incomingStatus } = payload;
    const { fee_transaction, type } = collection_request;

    const txData = await MobileMoneyService.generateMobileMoneyData(collection_request);
    const { reference, purpose, metadata, status, school } = txData.data;

    metadata.collectionId = collectionId;
    metadata.type = type;

    saveThirdPartyLogsREPO({
      event: 'collection.received',
      message: `Mobile-Money-Collection:${incomingStatus}`,
      endpoint: `${STEWARD_BASE_URL}/webhook/beyonic`,
      school: school.id,
      endpoint_verb: 'POST',
      status_code: '200',
      payload: JSON.stringify(payload),
      provider_type: 'payment-provider',
      provider: 'BEYONIC',
      reference,
    });

    await MobileMoneyService.completeTransaction({ reference, purpose, metadata, status });
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

export const completePayment = async (payload: any): Promise<any> => {
  try {
    await bayonicPaymentHandler(payload);
  } catch (error: any) {
    console.log(error);
    throw error;
  }
  // try {
  //   console.log(payload);
  //   const { id: paymentId, collection_request, state: incomingStatus } = payload;
  //   const { fee_transaction, type } = collection_request;

  //   const txData = await MobileMoneyService.generateMobileMoneyData(collection_request);
  //   const { reference, purpose, metadata, status, school } = txData.data;

  //   metadata.paymentId = paymentId;
  //   metadata.type = type;

  //   // saveThirdPartyLogsREPO({
  //   //   event: 'collection.received',
  //   //   message: `Mobile-Money-Collection:${incomingStatus}`,
  //   //   endpoint: `${STEWARD_BASE_URL}/webhook/beyonic`,
  //   //   school: school.id,
  //   //   endpoint_verb: 'POST',
  //   //   status_code: '200',
  //   //   payload: JSON.stringify(payload),
  //   //   provider_type: 'payment-provider',
  //   //   provider: 'BEYONIC',
  //   //   reference,
  //   // });

  //   // await MobileMoneyService.completeTransaction({ reference, purpose, metadata, status });
  // } catch (error: any) {
  //   console.log(error);
  //   throw error;
  // }
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
    case 'payment.status.changed':
      await completePayment(payload.data);
      break;
    default:
      break;
  }
}
