import { log } from 'winston';
import { getTransactionsREPO } from '../database/repositories/transaction.repo';
import { sendObjectResponse, BadRequestException } from '../utils/errors';
import { Log } from '../utils/logs';

export const listTransactions = async (data: any): Promise<any> => {
  const { user_id } = data;
  try {
    const existingTransactions = await getTransactionsREPO({ user_id }, []);
    if (!existingTransactions.length) throw Error('Sorry, no transaction has been created');

    return sendObjectResponse('Transactions retrieved successfully', existingTransactions);
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message || 'Transactions retrieval failed, kindly try again');
  }
};

export const getTransaction = async (data: any): Promise<any> => {
    const { user_id, id } = data;
    try {
      const existingTransaction = await getTransactionsREPO({ user_id, id }, []);
      if (!existingTransaction) throw Error('Transaction not found');
  
      return sendObjectResponse('Transaction retrieved successfully', existingTransaction);
    } catch (e: any) {
      console.log({ e });
      return BadRequestException(e.message || 'Transaction retrieval failed, kindly try again');
    }
  };
