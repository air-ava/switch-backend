import { RequestHandler } from 'express';
import { v4 } from 'uuid';
import { Not, In } from 'typeorm';
import { oldSendObjectResponse } from '../utils/errors';
import { Service as WalletService } from '../services/wallet.service';
import { getQueryRunner } from '../database/helpers/db';
import { Sanitizer } from '../utils/sanitizer';
import { updateTransactionREPO } from '../database/repositories/transaction.repo';
import Settings from '../services/settings.service';

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
  const reference = v4();
  let purpose = 'Funding:Wallet';
  if (req.query.type === 'school-fees') purpose = 'Payment:School-Fees';
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

    const response = await WalletService.creditWallet(payload);
    const {
      success: debitSuccess,
      data: transactionFees,
      error: debitError,
    } = await WalletService.debitTransactionFees({
      wallet_id: wallet.id,
      reference,
      user: req.user,
      description: req.body.description,
      feesNames: ['school-fees', 'credit-fees'],
      transactionAmount: req.body.amount,
      t,
    });
    if (!debitSuccess) throw debitError;

    const feesConfig = Settings.get('TRANSACTION_FEES');
    const feesPurposeNames: string[] = [feesConfig['school-fees'].purpose, feesConfig['credit-fees'].purpose];
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
    return res.status(responseCode).json(oldSendObjectResponse(message || error, data, true));
  } catch (error) {
    console.log({ error });
    await t.rollbackTransaction();
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.', data: error });
  } finally {
    await t.release();
  }
};
