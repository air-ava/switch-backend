import joiDate from '@joi/date';
import Joi from 'joi';
import * as bcrypt from 'bcrypt';
import randomstring from 'randomstring';
import { QueryRunner } from 'typeorm';
import { dbTransaction } from '../database/helpers/db';
import { STATUSES } from '../database/models/status.model';
import { fetchCard, fetchCards, saveCard } from '../database/repositories/cards.repo';
import { saveCardTransaction, updateCardTransaction } from '../database/repositories/cardTransactions.repo';
import { getTransactionByExternalRef, saveTransaction } from '../database/repositories/transaction.repo';
import {
  fundFromSavedCardReq,
  IChargeCard,
  initiateChargeToSaveReq,
  validateChargeReq,
  validateChargeRes,
  verifyWebhookChargeReq,
} from '../dto/cards.dto';
import { chargedTokenizedCard, initiateCharge, validateCharge, verifyCharge } from '../integrations/flutterwave/cards';
import { BadRequestException, sendObjectResponse } from '../utils/errors';
import { ControllerResponse } from '../utils/interface';
import {
  chargeSavedCardForFundingSCHEMA,
  initiateCardChargeToSaveSCHEMA,
  validateCardChargeSCHEMA,
  verifyChargeFromWebhookSCHEMA,
} from '../validators/cards.validator';
import { updateScholarshipApplication } from '../database/repositories/scholarshipApplication.repo';
import { statusOfTransaction } from '../utils/utils';

const joi = Joi.extend(joiDate);

export const initiateCardChargeToSave = async (payload: initiateChargeToSaveReq): Promise<any> => {
  try {
    const { currency, cardNumber, cvv, expiryMonth, expiryYear, amount, email, name, redirectUrl, pin, user_id, reference } = payload;

    const cardDetails: IChargeCard = { cardNumber, cvv, expiryMonth, expiryYear, amount, email, name, redirectUrl, pin, reference };
    const schema = joi.object(initiateCardChargeToSaveSCHEMA).and('pin', 'reference');

    const validation = schema.validate({ ...cardDetails, user_id, currency });
    if (validation.error) throw Error(validation.error.message);

    return await dbTransaction(async (queryRunner: QueryRunner) => {
      const savedCard = await fetchCard(
        {
          user_id,
          first6: cardDetails.cardNumber.substring(0, 6),
          last4: cardDetails.cardNumber.substring(cardDetails.cardNumber.length - 4),
          status: STATUSES.ACTIVE,
        },
        ['id'],
        queryRunner,
      );

      if (savedCard) throw Error('Card is already saved');

      const transactionReference =
        cardDetails.reference || randomstring.generate({ length: 15, capitalization: 'lowercase', charset: 'alphanumeric' });

      if (!cardDetails.reference) await saveCardTransaction({ tx_reference: transactionReference, processor: 'flutterwave' }, queryRunner);

      // Using Mock Data to check for General and Specific currencies charge amount

      const chargeResult = await initiateCharge({
        ...cardDetails,
        reference: transactionReference,
        amount: amount / 100,
        currency,
        metadata: {
          purpose: 'card_charge',
          user_id,
        },
      });

      if (!chargeResult.success)
        throw Error(chargeResult.error === 'error' ? 'There was a problem contacting your bank. Please try later.' : chargeResult.error);

      const { authorization } = chargeResult.data.meta;

      if (authorization.mode === 'pin') {
        await updateCardTransaction(
          { tx_reference: transactionReference },
          {
            processor_response: chargeResult.data.message,
            updated_at: new Date(),
          },
          queryRunner,
        );
        return {
          success: true,
          message: chargeResult.data.message,
          data: {
            reference: transactionReference,
            authMode: authorization.mode,
          },
        };
      }

      if (authorization.mode === 'otp') {
        await updateCardTransaction(
          { tx_reference: transactionReference },
          {
            processor_response: chargeResult.data.data.processor_response,
            processor_transaction_id: chargeResult.data.data.id,
            processor_transaction_reference: chargeResult.data.data.flw_ref,
            updated_at: new Date(),
          },
          queryRunner,
        );

        return {
          success: true,
          message: chargeResult.data.data.processor_response,
          data: {
            reference: chargeResult.data.data.flw_ref,
            authMode: authorization.mode,
          },
        };
      }

      if (authorization.mode === 'redirect') {
        await updateCardTransaction(
          { tx_reference: transactionReference },
          {
            processor_response: chargeResult.data.data.processor_response,
            processor_transaction_reference: chargeResult.data.data.flw_ref,
            processor_transaction_id: chargeResult.data.data.id,
            updated_at: new Date(),
          },
          queryRunner,
        );
        return {
          success: true,
          message: chargeResult.data.data.processor_response,
          data: {
            reference: chargeResult.data.data.flw_ref,
            authMode: authorization.mode,
            redirect: authorization.redirect,
            transactionId: chargeResult.data.data.id,
          },
        };
      }

      throw Error('Could not complete transaction');
    });
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};

export const validateCardCharge = async (payload: validateChargeReq): Promise<validateChargeRes> => {
  try {
    const { reference, otp, user_id } = payload;

    const schema = joi.object(validateCardChargeSCHEMA);
    const validation = schema.validate({ reference, otp });
    if (validation.error) throw Error(validation.error.message);

    return await dbTransaction(async (queryRunner: QueryRunner) => {
      const validationResult = await validateCharge(reference, otp);
      if (!validationResult.success || validationResult.data.data.status !== 'successful') throw Error(validationResult.error);

      const verificationResult = await verifyCharge(validationResult.data.data.id);
      if (!verificationResult.success || verificationResult.data.data.status !== 'successful')
        throw Error(verificationResult.error || verificationResult.data.data.processor_response);

      await updateCardTransaction(
        { processor_transaction_reference: verificationResult.data.data.flw_ref },
        {
          processor_response: verificationResult.data.data.processor_response,
          updated_at: new Date(),
        },
        queryRunner,
      );

      const { card } = verificationResult.data.data;

      const userCards = await fetchCards({ user_id, status: STATUSES.ACTIVE }, ['id', 'first6', 'last4', 'default'], queryRunner);

      if (!userCards.length) {
        await saveCard(
          {
            authorization: card.token,
            country: card.country,
            default: true,
            processor: 'flutterwave',
            first6: card.first_6digits,
            last4: card.last_4digits,
            issuer: card.issuer,
            type: card.type,
            user_id,
            currency: verificationResult.data.data.currency.toUpperCase(),
            status: STATUSES.ACTIVE,
          },
          queryRunner,
        );
      } else {
        const [existingCard] = userCards.filter((savedCard) => savedCard.first6 === card.first_6digits && savedCard.last4 === card.last_4digits);
        if (!existingCard) {
          await saveCard(
            {
              authorization: card.token,
              country: card.country,
              default: false,
              processor: 'flutterwave',
              first6: card.first_6digits,
              last4: card.last_4digits,
              issuer: card.issuer,
              type: card.type,
              user_id,
              currency: verificationResult.data.data.currency.toUpperCase(),
              status: STATUSES.ACTIVE,
            },
            queryRunner,
          );
        }
      }

      // await saveTransaction({
      //   user_id,
      //   amount: Number(verificationResult.data.data.amount) * 100,
      //   purpose: verificationResult.data.data.meta.purpose,
      //   metadata: {
      //     processor_transaction_id: verificationResult.data.data.id,
      //     external_reference: verificationResult.data.data.flw_ref,
      //   },
      //   reference,
      //   description: `${card.first_6digits}******${card.last_4digits}`,
      //   txn_type: 'credit',
      //   t: queryRunner,
      // });

      return sendObjectResponse('Transaction successful', {
        reference: verificationResult.data.data.tx_ref,
        transactionId: verificationResult.data.data.id,
      });
    });
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};

export const chargeSavedCardForFunding = async (payload: fundFromSavedCardReq): Promise<ControllerResponse> => {
  try {
    const { currency, user_id, userEmail, amount, cardId, password, user } = payload;

    const schema = joi.object(chargeSavedCardForFundingSCHEMA);
    const validation = schema.validate({ user_id, amount, cardId, userEmail, password, currency });
    if (validation.error) throw Error(validation.error.message);

    return await dbTransaction(async (queryRunner: QueryRunner) => {
      if (password && !bcrypt.compareSync(password, user.password)) throw Error('Provided PIN is incorrect');

      const card = await fetchCard(
        { id: cardId, user_id, status: STATUSES.DELETED },
        ['id', 'authorization', 'first6', 'last4', 'currency'],
        queryRunner,
      );
      if (!card) throw Error('Card does not exist for selected wallet');

      const tx_reference = randomstring.generate({ length: 15, capitalization: 'lowercase', charset: 'alphanumeric' });

      await saveCardTransaction(
        {
          tx_reference,
          processor: 'flutterwave',
        },
        queryRunner,
      );

      // No need for any Fix

      const chargeResponse = await chargedTokenizedCard({
        amount: Number(amount) / 100,
        reference: tx_reference,
        token: card.authorization,
        userEmail,
        metadata: {
          user_id,
          purpose: 'card_funding',
        },
      });

      if (!chargeResponse.success || chargeResponse.data.data.status !== 'successful')
        throw Error(chargeResponse.error || chargeResponse.data.data.processor_response);

      await updateCardTransaction(
        { tx_reference },
        {
          processor_response: chargeResponse.data.data.processor_response,
          processor_transaction_id: chargeResponse.data.data.id,
          processor_transaction_reference: chargeResponse.data.data.flw_ref,
          updated_at: new Date(),
        },
        queryRunner,
      );

      // await saveTransaction({
      //   user_id,
      //   amount,
      //   purpose: 'card_charge',
      //   metadata: {
      //     processor_transaction_id: chargeResponse.data.data.id,
      //     external_reference: chargeResponse.data.data.flw_ref,
      //   },
      //   reference: tx_reference,
      //   description: `${chargeResponse.data.data.card.first_6digits}******${chargeResponse.data.data.card.last_4digits}`,
      //   txn_type: 'credit',
      //   t: queryRunner,
      // });

      return sendObjectResponse('Charge successful');
    });
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};

export const verifyChargeFromWebhook = async (payload: verifyWebhookChargeReq): Promise<ControllerResponse> => {
  try {
    const { transactionId, user_id } = payload;

    const schema = joi.object(verifyChargeFromWebhookSCHEMA).xor('walletId', 'userMobile');
    const validation = schema.validate({ transactionId, user_id });
    if (validation.error) throw Error(validation.error.message);

    return await dbTransaction(async (queryRunner: QueryRunner) => {
      const verificationResult = await verifyCharge(transactionId);
      if (!verificationResult.success || verificationResult.data.data.status !== 'successful') throw Error('Transaction failed');

      const userId = user_id || verificationResult.data.data.meta.user_id;

      await updateCardTransaction(
        { processor_transaction_reference: verificationResult.data.data.flw_ref },
        {
          processor_response: verificationResult.data.data.processor_response,
          updated_at: new Date(),
        },
        queryRunner,
      );

      const { card } = verificationResult.data.data;
      const { purpose } = verificationResult.data.data.meta;

      const userCard = await fetchCard({ user_id: userId, status: STATUSES.ACTIVE }, ['id', 'first6', 'last4', 'default'], queryRunner);

      if (purpose === 'card_funding') {
        const existingCard = await fetchCard(
          {
            first6: card.first_6digits,
            last4: card.last_4digits,
            user_id: userId,
            status: STATUSES.ACTIVE,
          },
          ['id'],
          queryRunner,
        );

        if (!existingCard) {
          await saveCard(
            {
              authorization: card.token,
              country: card.country,
              default: !userCard?.id,
              processor: 'flutterwave',
              first6: card.first_6digits,
              last4: card.last_4digits,
              issuer: card.issuer,
              type: card.type,
              user_id: userId,
              status: STATUSES.ACTIVE,
              currency: verificationResult.data.data.currency.toUpperCase(),
            },
            queryRunner,
          );
        }

        const existingTransaction = await getTransactionByExternalRef(verificationResult.data.data.flw_ref, queryRunner);
        if (!existingTransaction.length) {
          // await saveTransaction({
          //   user_id,
          //   amount: Number(verificationResult.data.data.amount) * 100,
          //   purpose,
          //   metadata: {
          //     processor_transaction_id: verificationResult.data.data.id,
          //     external_reference: verificationResult.data.data.flw_ref,
          //   },
          //   reference: randomstring.generate({ length: 15, capitalization: 'lowercase', charset: 'alphanumeric' }),
          //   description: `${card.first_6digits}******${card.last_4digits}`,
          //   txn_type: 'credit',
          //   t: queryRunner,
          // });
        }
      }

      return sendObjectResponse('Transaction processed successfully');
    });
  } catch (e: any) {
    return BadRequestException(e.message);
  }
};

export const recordFLWWebhook = async (data: any): Promise<any> => {
  const { meta, ...response } = data;
  const { user_id, type, type_id } = meta;
  const tx_reference = randomstring.generate({ length: 15, capitalization: 'lowercase', charset: 'alphanumeric' });

  if (response['event.type'] === 'CARD_TRANSACTION')
    await saveCardTransaction({
      tx_reference,
      user_id,
      processor: 'flutterwave',
      processor_response: response.status,
      processor_transaction_id: response.id,
      processor_transaction_reference: response.flwRef,
    });

  // await saveTransaction({
  //   user_id,
  //   amount: response.amount + response.charged_amount,
  //   purpose: 'card_charge',
  //   response: response.status,
  //   metadata: {
  //     processor_transaction_id: response.id,
  //     external_reference: response.flwRef,
  //     customer: response.customer,
  //     card: response.entity,
  //     type,
  //     type_id,
  //   },
  //   reference: tx_reference,
  //   description: `${response.entity.card6}******${response.entity.card_last4}`,
  //   txn_type: 'credit',
  // });

  const status = statusOfTransaction(response.status);

  if (status && type === 'scholarship_applications') {
    updateScholarshipApplication({ id: type_id }, { payment_reference: tx_reference });
  }

  // todo: add third_part logs, use mongo db to store the payload
};
