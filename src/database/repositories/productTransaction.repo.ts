import randomstring from 'randomstring';
import { QueryRunner, getRepository, In, UpdateResult } from 'typeorm';
import { IProductTransactions } from '../modelInterfaces';
import { ProductTransactions } from '../models/productTransactions.model';

export const getProductTransaction = async (
  queryParam: Partial<IProductTransactions> | any,
  selectOptions: Array<keyof ProductTransactions>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<ProductTransactions | undefined> => {
  return t
    ? t.manager.findOne(ProductTransactions, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(ProductTransactions).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listProductTransaction = async (
  queryParam: Partial<IProductTransactions> | any,
  selectOptions: Array<keyof ProductTransactions>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<ProductTransactions[]> => {
  return t
    ? t.manager.find(ProductTransactions, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(ProductTransactions).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listProductTransactionForBeneficiary = async (queryParam: Partial<IProductTransactions> | any): Promise<ProductTransactions[]> => {
  const { studentPaymentTransactionIds } = queryParam;
  const queryBuilder = getRepository(ProductTransactions).createQueryBuilder('paymentHistory');
  const query = queryBuilder
    .leftJoinAndSelect('paymentHistory.Payer', 'Payer')
    .leftJoinAndSelect('paymentHistory.beneficiaryFee', 'beneficiaryFee')
    .leftJoinAndSelect('paymentHistory.Transactions', 'Transactions')
    .where('paymentHistory.beneficiary_product_payment_id IN (:...ids)', {
      ids: studentPaymentTransactionIds,
    });
  const analytics = await query.groupBy('paymentHistory.session').addGroupBy('paymentHistory.id').addGroupBy('Transactions.id').getRawMany();
  return analytics;
};

export const saveProductTransaction = (
  queryParams: Partial<IProductTransactions> | Partial<IProductTransactions>[] | any,
  transaction?: QueryRunner,
): Promise<any> => {
  const repository = transaction ? transaction.manager.getRepository(ProductTransactions) : getRepository(ProductTransactions);
  const payload = {
    code: `ptx_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return repository.save(payload);
};

export const updateProductTransaction = (
  queryParams: Pick<IProductTransactions, 'id'>,
  updateFields: Partial<IProductTransactions>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(ProductTransactions, queryParams, updateFields) : getRepository(ProductTransactions).update(queryParams, updateFields);
};

// export const saveProductTransaction = (
//   transaction_details: Omit<IProductTransactions, 'id' | 'status' | 'created_at' | 'blocked_at' | 'updated_at' | 'code'> & { t?: QueryRunner },
// ): Promise<any> => {
//   const { t } = transaction_details;
//   const repository = t ? t.manager.getRepository(ProductTransactions) : getRepository(ProductTransactions);
//   return repository.save(transaction_details);
// };
