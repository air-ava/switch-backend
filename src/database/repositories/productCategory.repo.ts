import { QueryRunner, getRepository } from 'typeorm';
import { IProductCategory } from '../modelInterfaces';
import { ProductCategory } from '../models/productCategory.model';

export const getProductCategoriesREPO = (
  queryParam:
    | Partial<IProductCategory>
    | {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      }
    | any,
  selectOptions: Array<keyof ProductCategory>,
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<IProductCategory[]> => {
  return transaction
    ? transaction.manager.find(ProductCategory, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(ProductCategory).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};
