import { log } from 'winston';
import randomstring from 'randomstring';
import {
  getOneTransactionREPO,
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

const getTransactionReference = async (existingTransaction: any): Promise<string> => {
  const reference = existingTransaction.document_reference
    ? existingTransaction.document_reference
    : `trx_${randomstring.generate({ length: 12, capitalization: 'lowercase', charset: 'alphanumeric' })}`;
  return reference;
};

export const listTransactions = async (data: any): Promise<any> => {
  const { userId, type } = data;
  let purpose = '';
  if (type === 'school-fees') purpose = 'Payment:School-Fees';
  try {
    const existingTransactions = await getTransactionsREPO({ userId, ...(purpose && { purpose }) }, [], ['User', 'Wallet', 'Reciepts']);

    return sendObjectResponse('Transactions retrieved successfully', existingTransactions);
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message || 'Transactions retrieval failed, kindly try again');
  }
};

export const statsOnTransactions = async (data: any): Promise<any> => {
  const { userId } = data;
  try {
    const [totalIn, totalOut] = await Promise.all([getTotalSuccessfulCredit(userId), getTotalDebited(userId)]);

    return sendObjectResponse('Transactions analytics retrieved successfully', { ...totalIn, ...totalOut });
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
  const { from, to, groupBy = 'daily', txnType = 'credit', wallet } = data;
  try {
    const transactionAnalytics = await getTransactionsByGroup(wallet, from && from, to && to, groupBy, txnType);
    console.log({ data, transactionAnalytics });
    
    return sendObjectResponse('Transaction analytics gotten successfully', transactionAnalytics);
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message || 'Getting transaction analytics failed, kindly try again');
  }
};