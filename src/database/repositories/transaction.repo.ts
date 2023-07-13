/* eslint-disable no-prototype-builtins */
/* eslint-disable no-param-reassign */
import { QueryRunner, InsertResult, getRepository, UpdateResult, MoreThan, LessThan } from 'typeorm';
import Utils, { isValidDate, singleDayStartAndEnd } from '../../utils/utils';
import { ITransactions } from '../modelInterfaces';
import { Transactions } from '../models/transaction.model';

const dateFns = require("date-fns");

export const saveTransaction = (
  transaction_details: Omit<ITransactions, 'id' | 'note' | 'document_reference' | 'created_at' | 'updated_at'> & { t?: QueryRunner },
): Promise<InsertResult> => {
  const { t, purpose } = transaction_details;
  if (purpose.includes('Fees:')) transaction_details.channel = 'wallet';
  return t ? t.manager.insert(Transactions, transaction_details) : getRepository(Transactions).insert(transaction_details);
};

export const getTransactionByExternalRef = (external_reference: string, t?: QueryRunner): Promise<{ existingtransaction: string }[]> => {
  return t
    ? t.manager.query(
        `SELECT metadata -> 'external_reference' as existingTransaction FROM transactions WHERE metadata ->> 'external_reference' = '${external_reference}'`,
      )
    : getRepository(Transactions).query(
        `SELECT metadata -> 'external_reference' as existingTransaction FROM transactions WHERE metadata ->> 'external_reference' = '${external_reference}'`,
      );
};

export const createTransactionREPO = (
  queryParams: Omit<ITransactions, 'id' | 'created_at' | 'updated_at'>,
  transaction?: QueryRunner,
): Promise<InsertResult> => {
  return transaction ? transaction.manager.insert(Transactions, queryParams) : getRepository(Transactions).insert(queryParams);
};

export const createAndGetTransactionREPO = (
  queryParams: Omit<ITransactions, 'id' | 'created_at' | 'updated_at'>,
  transaction?: QueryRunner,
): Promise<Transactions> => {
  return transaction ? transaction.manager.save(Transactions, queryParams) : getRepository(Transactions).save(queryParams);
};

export const getOneTransactionREPO = (
  queryParam: Partial<ITransactions | any>,
  selectOptions: Array<keyof Transactions>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<ITransactions | undefined | any> => {
  return transaction
    ? transaction.manager.findOne(Transactions, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Transactions).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const updateTransactionREPO = (
  queryParams: Partial<ITransactions>,
  updateFields: Partial<ITransactions | any>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(Transactions, queryParams, updateFields) : getRepository(Transactions).update(queryParams, updateFields);
};

export const getTransactionsREPO = async (
  queryParam:
    | Partial<ITransactions>
    | {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      }
    | any,
  selectOptions: Array<keyof Transactions>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<ITransactions[] | any> => {
  const { perPage = 20, cursor, ...rest } = queryParam;
  const { order, query } = Utils.paginationOrderAndCursor(cursor, rest);

  const repository = t ? t.manager.getRepository(Transactions) : getRepository(Transactions);
  const [transactions, total] = await Promise.all([
    repository.find({
      where: query,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
      order,
      take: parseInt(perPage, 10),
    }),
    repository.count({ where: rest }),
  ]);

  const { hasMore, newCursor } = Utils.paginationMeta({ responseArray: transactions, perPage });

  return {
    transactions,
    meta: {
      total,
      perPage,
      hasMore,
      cursor: newCursor,
    },
  };
};

export const getTotalCredited = (userId: string): Promise<{ total: number } | undefined> => {
  return getRepository(Transactions)
    .createQueryBuilder('transaction')
    .select('SUM(transaction.amount)', 'totalIn')
    .where('transaction.txn_type = :txn_type AND transaction.userId = :userId', { txn_type: 'credit', userId })
    .getRawOne();
};

export const getTotalSuccessfulCredit = (userId: string): Promise<{ total: number } | undefined> => {
  return getRepository(Transactions)
    .createQueryBuilder('transaction')
    .select('SUM(transaction.amount)', 'totalIn')
    .where('transaction.txn_type = :txn_type AND transaction.userId = :userId AND transaction.status = 14', { txn_type: 'credit', userId })
    .getRawOne();
};

export const getTotalSuccessfulDebit = (walletId: number, notPurpose: string, created_at?: Date): Promise<{ totalOut: number } | undefined> => {
  const { startDate, endDate } = singleDayStartAndEnd(created_at);
  let whereQuery =
    'transaction.txn_type = :txn_type AND transaction.walletId = :walletId AND transaction.status = 14 AND transaction.purpose NOT LIKE :notPurpose';
  if (created_at) whereQuery += ' AND transaction.created_at >= :startDate AND transaction.created_at <= :endDate';
  return getRepository(Transactions)
    .createQueryBuilder('transaction')
    .select('SUM(transaction.amount)', 'totalOut')
    .where(whereQuery, {
      txn_type: 'debit',
      walletId,
      created_at,
      notPurpose: `%${notPurpose}%`,
      startDate,
      endDate,
    })
    .getRawOne();
};

export const getTotalDebited = (userId: string): Promise<{ total: number } | undefined> => {
  return getRepository(Transactions)
    .createQueryBuilder('transaction')
    .select('SUM(transaction.amount)', 'totalOut')
    .where('transaction.txn_type = :txn_type AND transaction.userId = :userId AND transaction.purpose NOT LIKE :notPurpose', {
      txn_type: 'debit',
      userId,
      notPurpose: `%Fees:%`,
    })
    .getRawOne();
};

export const getTotalSuccessfulCreditForSettlement = (
  userId: string,
  created_at: string,
  purpose: string,
): Promise<{ total: number } | undefined> => {
  return getRepository(Transactions)
    .createQueryBuilder('transaction')
    .select('SUM(transaction.amount)', 'totalIn')
    .where(
      'transaction.txn_type = :txn_type AND transaction.userId = :userId AND transaction.status = 14 AND transaction.created_at = :created_at AND transaction.purpose LIKE :purpose',
      {
        txn_type: 'credit',
        userId,
        created_at,
        purpose: `%${purpose}%`,
      },
    )
    .getRawOne();
};

// export const getListOfTransactionsForSettlement = (walletId: number, created_at: Date, purpose: string): Promise<{ total: number } | undefined> => {
//   const { startDate, endDate } = singleDayStartAndEnd(created_at);
//   const transactions = getRepository(Transactions)
//     .createQueryBuilder('transaction')
//     .select('transaction.wallet_id', 'wallet_id')
//     .addSelect('SUM(CASE WHEN transaction.txn_type = :creditTxnType THEN transaction.amount ELSE 0 END)', 'credit_total')
//     .addSelect('SUM(CASE WHEN transaction.txn_type = :debitTxnType THEN transaction.amount ELSE 0 END)', 'debit_total')
//     .where(
//       'transaction.wallet_id = :walletId AND transaction.txn_type IN (:creditTxnType, :debitTxnType) AND transaction.created_at >= :startDate AND transaction.created_at <= :endDate',
//       {
//         walletId,
//         creditTxnType: 'credit',
//         debitTxnType: 'debit',
//         startDate,
//         endDate,
//       },
//     )
//     .groupBy('transaction.wallet_id')
//     .getRawMany();

//   return transactions.map(({ wallet_id, credit_total, debit_total }) => ({
//     wallet_id,
//     credit_total: credit_total || 0,
//     debit_total: debit_total || 0,
//     total_balance: (credit_total || 0) - (debit_total || 0),
//   }));
// };
export const getListOfTransactionsForSettlement = async (
  walletId: number,
  created_at: Date,
  purpose: string,
): Promise<{
  transactions: ITransactions[] | Transactions[];
  transactionCount: number;
  transactionTotal: number;
}> => {
  const { startDate, endDate } = singleDayStartAndEnd(created_at);
  console.log({ startDate, endDate });
  const debits = await getRepository(Transactions)
    .createQueryBuilder('transaction')
    .select(['transaction.reference', 'transaction.amount'])
    .where(
      'transaction.walletId = :walletId AND transaction.txn_type = :type AND transaction.created_at >= :startDate AND transaction.created_at <= :endDate AND transaction.purpose LIKE :purpose AND transaction.status = 14',
      {
        type: 'debit',
        walletId,
        startDate,
        endDate,
        purpose: `%${purpose}%`,
      },
    )
    .getMany();

  // const creditReferences = credits.map((credit) => credit.reference);
  const debitAmounts: { [key: string]: any } | any = debits.reduce((acc, debit) => {
    if (acc.hasOwnProperty(debit.reference)) {
      (acc as { [key: string]: any })[debit.reference] += debit.amount;
    } else {
      (acc as { [key: string]: any })[debit.reference] = debit.amount;
    }
    return acc;
  }, {});

  const creditTransactions = await getRepository(Transactions)
    .createQueryBuilder('transaction')
    .where('transaction.txn_type = :type AND transaction.status = 14', { type: 'credit' })
    .getMany();

  let transactionCount = 0;
  let transactionTotal = 0;

  creditTransactions.forEach((credit) => {
    const matchingCreditAmount = debitAmounts[credit.reference];
    // console.log()
    transactionTotal += Number(credit.amount);
    transactionCount += 1;
    if (matchingCreditAmount) {
      credit.amount -= matchingCreditAmount;
      transactionTotal -= matchingCreditAmount;
      if (credit.amount < 1) transactionCount -= 1;
    }
  });

  return {
    transactions: creditTransactions,
    transactionCount,
    transactionTotal,
  };
};

export const getTransactionsByGroup = async (
  wallet: number,
  from?: string,
  to?: string,
  groupType = 'daily',
  txnType?: 'credit' | 'debit',
  purpose?: string,
): Promise<any> => {
  let groupBy: string;
  let select: string;
  let where = ''; // Initialize to null
  const today = new Date();
  from = dateFns.subDays(today, 100).toISOString();
  to = today.toISOString();

  switch (groupType) {
    case 'daily':
      groupBy = 'DATE(transaction.created_at)';
      select = 'DATE(transaction.created_at)';
      break;
    case 'weekly':
      groupBy = 'YEARWEEK(transaction.created_at)';
      select = 'YEARWEEK(transaction.created_at)';
      break;
    case 'monthly':
      groupBy = "DATE_FORMAT(transaction.created_at, '%Y-%m')";
      select = "DATE_FORMAT(transaction.created_at, '%Y-%m')";
      break;
    case 'yearly':
      groupBy = 'YEAR(transaction.created_at)';
      select = 'YEAR(transaction.created_at)';
      break;
    default:
      throw new Error('Invalid group type');
  }

  const query = getRepository(Transactions)
    .createQueryBuilder('transaction')
    .select(select, 'date')
    .addSelect('SUM(transaction.amount)', 'total')
    .where(`transaction.walletId = ${wallet}`);

  if (txnType) query.andWhere(`transaction.txn_type = '${txnType}'`);
  if (purpose) query.andWhere(`transaction.purpose NOT LIKE %${purpose}%`);

  if (from || to) {
    if (from && isValidDate(from)) query.andWhere(`transaction.created_at >= '${from}'`);
    if (to && isValidDate(to)) query.andWhere(`transaction.created_at <= '${to}'`);
  }

  const transactions = await query.groupBy(groupBy).orderBy(groupBy, 'ASC').getRawMany();

  console.log({ transactions });

  return transactions;
};
