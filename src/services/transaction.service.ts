import { log } from 'winston';
import { getOneTransactionREPO, getTransactionsREPO, updateTransactionREPO } from '../database/repositories/transaction.repo';
import { sendObjectResponse, BadRequestException } from '../utils/errors';
import { Log } from '../utils/logs';

export const listTransactions = async (data: any): Promise<any> => {
  const { userId } = data;
  try {
    const existingTransactions = await getTransactionsREPO({ userId }, [], ['User', 'Wallet']);
    // if (!existingTransactions.length) throw Error('Sorry, no transaction has been created');

    return sendObjectResponse('Transactions retrieved successfully', existingTransactions);
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message || 'Transactions retrieval failed, kindly try again');
  }
};

export const getTransaction = async (data: any): Promise<any> => {
  const { userId, id } = data;
  try {
    const existingTransaction = await getOneTransactionREPO({ userId, id }, [], ['User', 'Wallet']);
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

// addNoteToTransaction
// addDocumentToTransaction
// creditWallet
// debitWallet
