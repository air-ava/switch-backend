import randomstring from 'randomstring';
import { QueryRunner, getRepository, UpdateResult } from 'typeorm';
import { IProductType } from '../modelInterfaces';
import { ProductType } from '../models/productType.model';

export const getProductType = async (
  queryParam: Partial<IProductType> | any,
  selectOptions: Array<keyof ProductType>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<ProductType | undefined> => {
  const repository = t ? t.manager.getRepository(ProductType) : getRepository(ProductType);
  return repository.findOne({
    where: queryParam,
    select: selectOptions.length ? selectOptions.concat(['id']) : undefined,
    relations: relationOptions,
  });
};

export const listProductTypes = async (
  queryParam: Partial<IProductType> | Partial<IProductType>[] | any,
  selectOptions: Array<keyof ProductType>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<ProductType[]> => {
  const repository = t ? t.manager.getRepository(ProductType) : getRepository(ProductType);
  return repository.find({
    where: queryParam,
    select: selectOptions.length ? selectOptions.concat(['id']) : undefined,
    relations: relationOptions,
  });
};

export const saveProductType = (queryParams: Partial<IProductType> | Partial<IProductType>[] | any, transaction?: QueryRunner): Promise<any> => {
  const repository = transaction ? transaction.manager.getRepository(ProductType) : getRepository(ProductType);
  const payload = {
    code: `prt_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return repository.save(payload);
};

export const updateProductType = (
  queryParams: Partial<IProductType> | any,
  updateFields: Partial<IProductType> | any,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  const repository = t ? t.manager.getRepository(ProductType) : getRepository(ProductType);
  return repository.update(queryParams, updateFields);
};
