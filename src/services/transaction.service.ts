import { Like, Not } from 'typeorm';
/* eslint-disable no-restricted-syntax */
import { log } from 'winston';
import randomstring from 'randomstring';
import { STATUSES } from '../database/models/status.model';
import {
  getOneTransactionREPO,
  getTotalChargesDebited,
  getTotalCredited,
  getTotalDebited,
  getTotalSuccessfulCredit,
  getTransactionsByGroup,
  getTransactionsREPO,
  updateTransactionREPO,
} from '../database/repositories/transaction.repo';
import { sendObjectResponse, BadRequestException } from '../utils/errors';
import { Log } from '../utils/logs';
import { createAsset } from './assets.service';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';

export const getTransactionReference = async (existingTransaction: any): Promise<string> => {
  const reference = existingTransaction.document_reference
    ? existingTransaction.document_reference
    : `trx_${randomstring.generate({ length: 12, capitalization: 'lowercase', charset: 'alphanumeric' })}`;
  return reference;
};

export const listTransactions = async (data: any): Promise<any> => {
  const { userId, type, perPage, page, from, to } = data;
  let purpose = '';
  if (type === 'school-fees') purpose = 'Payment:School-Fees';
  try {
    const existingTransactions = await getTransactionsREPO(
      {
        userId,
        purpose: purpose || Not(Like(`%Fees:%`)),
        status: Not(STATUSES.FAILED),
        perPage,
        page,
        from,
        to,
      },
      [],
      ['User', 'Wallet', 'Reciepts'],
    );

    return sendObjectResponse('Transactions retrieved successfully', existingTransactions);
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message || 'Transactions retrieval failed, kindly try again');
  }
};

export const statsOnTransactions = async (data: any): Promise<any> => {
  const { userId } = data;
  try {
    const [totalIn, totalOut, totalCharges] = await Promise.all([
      getTotalSuccessfulCredit(userId),
      getTotalDebited(userId),
      getTotalChargesDebited(userId),
    ]);

    return sendObjectResponse('Transactions analytics retrieved successfully', { ...totalIn, ...totalOut, ...totalCharges });
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message || 'Transactions retrieval failed, kindly try again');
  }
};

export const getTransaction = async (data: any): Promise<any> => {
  const { userId, id } = data;
  try {
    const existingTransaction = await getOneTransactionREPO({ userId, id }, [], ['User', 'Wallet', 'Reciepts']);
    if (!existingTransaction) throw Error('Transaction not found');

    return sendObjectResponse('Transaction retrieved successfully', existingTransaction);
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message || 'Transaction retrieval failed, kindly try again');
  }
};

export const addNoteToTransaction = async (data: any): Promise<any> => {
  const { note, userId, id } = data;
  try {
    const existingTransaction = await getOneTransactionREPO({ userId, id }, []);
    if (!existingTransaction) throw Error('Transaction not found');

    await updateTransactionREPO({ id: existingTransaction.id }, { note });

    return sendObjectResponse('Transaction Note updated successfully');
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message || 'Adding Note to transaction failed, kindly try again');
  }
};

export const addDocumentToTransaction = async (data: any): Promise<any> => {
  const { documents, user, id, process = 'transactions' } = data;
  try {
    const existingTransaction = await getOneTransactionREPO({ userId: user.id, id }, []);
    if (!existingTransaction) throw Error('Transaction not found');

    const reference = await getTransactionReference(existingTransaction);

    await Promise.all(
      documents.map((document: string) =>
        createAsset({
          imagePath: document,
          user: user.id,
          trigger: `${process}:add_reciepts`,
          reference,
          organisation: user.organisation,
          entity: process,
          entity_id: existingTransaction.id || id,
          customName: `ref:${reference}|process:${process}-add_reciepts|payer:${user.first_name}${user.last_name}`,
        }),
      ),
    );

    await updateTransactionREPO({ id: existingTransaction.id }, { document_reference: reference });

    return sendObjectResponse('Transaction assets updated successfully');
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message || 'Adding Note to transaction failed, kindly try again');
  }
};

export const getTransactionsAnalytics = async (data: any): Promise<any> => {
  const { from, to, groupBy = 'daily', userId } = data;

  const foundWallet = await WalletREPO.findWallet({ userId, entity: 'school' }, []);
  if (!foundWallet) throw Error('Wallet does not exist');
  const { id: wallet } = foundWallet;

  try {
    const inflows = await getTransactionsByGroup(wallet, from && from, to && to, groupBy, 'credit');
    const outflows = await getTransactionsByGroup(wallet, from && from, to && to, groupBy, 'debit');

    const chartData: {
      name: string;
      inflow: number;
      outflow: number;
    }[] = [];

    const monthTotals: { [date: string]: { inflow: number; outflow: number } } = {};

    for (const { date, total } of inflows) {
      if (!monthTotals[date]) monthTotals[date] = { inflow: 0, outflow: 0 };
      monthTotals[date].inflow += Number(total);
    }

    for (const { date, total } of outflows) {
      if (!monthTotals[date]) monthTotals[date] = { inflow: 0, outflow: 0 };
      monthTotals[date].outflow += Number(total);
    }

    for (const date in monthTotals) {
      // eslint-disable-next-line no-prototype-builtins
      if (monthTotals.hasOwnProperty(date)) {
        const { inflow, outflow } = monthTotals[date];
        chartData.push({ name: new Date(date).toISOString(), inflow, outflow });
      }
    }

    return sendObjectResponse('Transaction analytics gotten successfully', {
      // transactionAnalyticsForCredit: inflows,
      // transactionAnalyticsForDebit: outflows,
      chartData,
    });
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message || 'Getting transaction analytics failed, kindly try again');
  }
};
