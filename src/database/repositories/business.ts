// import { getRepository, InsertResult, QueryRunner, UpdateResult } from 'typeorm';
// import { IBusiness } from '../modelInterfaces';
// import { Business } from '../models/business';

// export const createBusinessREPO = (
//   queryParams: Omit<IBusiness, 'id' | 'createdAt' | 'updatedAt' | 'user' | 'staff_size' | 'business_category'>,
//   t?: QueryRunner,
// ): Promise<InsertResult> => {
//   return t ? t.manager.insert(Business, queryParams) : getRepository(Business).insert(queryParams);
// };

// export const getOneBuinessREPO = (
//   queryParam: Partial<IBusiness>,
//   selectOptions: Array<keyof Business>,
//   t?: QueryRunner,
// ): Promise<IBusiness | undefined | any> => {
//   return t
//     ? t.manager.findOne(Business, {
//         where: queryParam,
//         ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
//       })
//     : getRepository(Business).findOne({ where: queryParam, ...(selectOptions.length && { select: selectOptions.concat(['id']) }) });
// };

// export const getOneBuinessREPO2 = (queryParam: Partial<IBusiness>, t?: QueryRunner): Promise<Business | undefined> => {
//   return t
//     ? t.manager.findOne(Business, {
//         where: queryParam,
//       })
//     : getRepository(Business).findOne({ where: queryParam });
// };

// export const updateBusinessREPO = (queryParams: Partial<IBusiness>, updateFields: Partial<IBusiness>, t?: QueryRunner): Promise<UpdateResult> => {
//   return t ? t.manager.update(Business, queryParams, updateFields) : getRepository(Business).update(queryParams, updateFields);
// };

// export const getBusinessByNameCaseInsensitiveREPO = (name: string, t?: QueryRunner): Promise<IBusiness | undefined> => {
//   const query = t ? t.manager.getRepository(Business).createQueryBuilder('business') : getRepository(Business).createQueryBuilder('business');
//   query.where(`LOWER(business.name) = LOWER(:name)`, { name });
//   return query.getOne();
// };
