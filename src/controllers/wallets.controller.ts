import { RequestHandler } from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 } from 'uuid';
import { Not, In } from 'typeorm';
import { ValidationError, oldSendObjectResponse, sendObjectResponse } from '../utils/errors';
import { Service as WalletService } from '../services/wallet.service';
import { getQueryRunner } from '../database/helpers/db';
import { Sanitizer } from '../utils/sanitizer';
import { getOneTransactionREPO, updateTransactionREPO } from '../database/repositories/transaction.repo';
import Settings from '../services/settings.service';
import sessionData from '../middleware/auth.middleware';
import AuditLogsService from '../services/auditLogs.service';
import ResponseService from '../utils/response';
import { freezeWalletValidator } from '../validators/wallet.validator';

export const getWalletCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await WalletService.getSchoolWallet({ user: req.user, type: 'fetchWallet' });
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, Sanitizer.sanitizeWallet(data), true));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const setWalletPinCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const response = await WalletService.setWalletPin(req.user, req.body.pin, req.body.type);
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, data, true));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const updateWalletPinCONTROLLER: RequestHandler = async (req, res) => {
  try {
    const payload = {
      user: req.user,
      oldPin: req.body.oldPin,
      newPin: req.body.newPin,
      type: req.body.type || 'permanent',
    };
    const response = await WalletService.updateWalletPin(payload);
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, data, true));
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  }
};

export const fundWalletCONTROLLER: RequestHandler = async (req, res) => {
  const { backOfficeUser } = req;
  let { user } = req;
  const { type } = req.query;
  const { code: id } = req.params;
  const { amount, description } = req.body;

  const txPurpose = Settings.get('TRANSACTION_PURPOSE');
  const feesConfig = Settings.get('TRANSACTION_FEES');

  let { purpose } = txPurpose['top-up'];
  const feesNames = ['credit-fees'];
  const feesPurposeNames: string[] = [feesConfig['credit-fees'].purpose];
  // eslint-disable-next-line default-case
  switch (type) {
    case 'school-fees':
      purpose = txPurpose['school-fees'].purpose;
      feesNames.push('school-fees');
      feesPurposeNames.push(feesConfig['school-fees'].purpose);
      break;
    case 'disburse-loan':
      purpose = txPurpose['disburse-loan'].purpose;
      feesNames.push('loan-processing-fees');
      feesPurposeNames.push(feesConfig['loan-processing-fees'].purpose);
      break;
  }

  if (!user || typeof user !== 'object') user = (await sessionData.getDashboardData({ id })).user;

  const reference = v4();
  const t = await getQueryRunner();

  try {
    const payload: any = { user, amount, description, purpose, reference, t };

    const { success, data: wallet, error: walletError } = await WalletService.getSchoolWallet({ user, t });
    if (!success) throw walletError;

    payload.wallet_id = wallet.id;

    const response = await WalletService.creditWallet(payload);
    // eslint-disable-next-line prettier/prettier
    const { success: debitSuccess, data: transactionFees, error: debitError } = await WalletService.debitTransactionFees({
      wallet_id: wallet.id,
      reference,
      user,
      description,
      feesNames,
      transactionAmount: amount,
      t,
    });      
    if (!debitSuccess) throw debitError;

    await updateTransactionREPO(
      { reference, purpose: Not(In(feesPurposeNames)) },
      {
        metadata: {
          transactionFees,
          fees: feesPurposeNames,
        },
      },
      t,
    );

    await t.commitTransaction();
    if (backOfficeUser) {
      const updatedTransaction = await getOneTransactionREPO({ reference, purpose: Not(In(feesPurposeNames)) }, []);
      AuditLogsService.createLog({
        event: `credit-wallet:for-${type}`,
        user_type: 'backOfficeUsers',
        user: backOfficeUser.id,
        delta: JSON.stringify(updatedTransaction),
        table_type: 'transaction',
        table_id: updatedTransaction.id,
      });
    }
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    return res.status(responseCode).json(oldSendObjectResponse(message || error, data, true));
  } catch (error) {
    console.log({ error });
    await t.rollbackTransaction();
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  } finally {
    await t.release();
  }
};

export const withdrawFromWalletCONTROLLER: RequestHandler = async (req, res) => {
  const reference = v4();
  const purpose = 'Withdraw:Wallet';
  const t = await getQueryRunner();
  try {
    const payload: any = {
      user: req.user,
      amount: req.body.amount,
      description: req.body.description,
      purpose,
      reference,
      t,
    };

    const { success, data: wallet, error: walletError } = await WalletService.getSchoolWallet({ user: req.user, t });
    if (!success) throw walletError;

    payload.wallet_id = wallet.id;

    const response = await WalletService.debitWallet(payload);
    const {
      success: debitSuccess,
      data: transactionFees,
      error: debitError,
    } = await WalletService.debitTransactionFees({
      wallet_id: wallet.id,
      reference,
      user: req.user,
      description: req.body.description,
      feesNames: ['debit-fees'],
      transactionAmount: req.body.amount,
      t,
    });
    if (!debitSuccess) throw debitError;

    const feesConfig = Settings.get('TRANSACTION_FEES');
    const feesPurposeNames: string[] = [feesConfig['debit-fees'].purpose];
    await updateTransactionREPO(
      { reference, purpose: Not(In(feesPurposeNames)) },
      {
        metadata: {
          transactionFees,
          fees: feesPurposeNames,
        },
      },
      t,
    );

    await t.commitTransaction();
    const responseCode = response.success === true ? 200 : 400;
    const { data, message, error } = response;
    // data.fees = transactionFees;
    return res.status(responseCode).json(sendObjectResponse(message || error, data));
  } catch (error) {
    console.log({ error });
    await t.rollbackTransaction();
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  } finally {
    await t.release();
  }
};

export const freezeWalletCONTROLLER: RequestHandler = async (req, res) => {
  const { backOfficeUser } = req;
  const { freeze } = req.body;

  const validation = freezeWalletValidator.validate(req.body);
  if (validation.error) throw new ValidationError(validation.error.message);

  const response = await WalletService.freezeWallet(req.body);
  const { data, message, error } = response;

  const wallet = response.data;
  AuditLogsService.createLog({
    event: `${freeze ? 'freeze' : 'unfreeze'}-wallet`,
    user_type: 'backOfficeUsers',
    user: backOfficeUser.id,
    delta: JSON.stringify(wallet),
    table_type: 'wallet',
    table_id: wallet.id,
  });
  return ResponseService.success(res, message || error);
};
