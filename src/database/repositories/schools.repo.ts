import { QueryRunner, getRepository, In, UpdateResult } from 'typeorm';
import randomstring from 'randomstring';
import { ISchools } from '../modelInterfaces';
import { Schools } from '../models/school.model';

export const getSchool = async (
  queryParam: Partial<ISchools> | any,
  selectOptions: Array<keyof Schools>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Schools | undefined> => {
  const repository = t ? t.manager.getRepository(Schools) : getRepository(Schools);
  return repository.findOne({
    where: queryParam,
    ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
    ...(relationOptions && { relations: relationOptions }),
  });
};

export const listSchools = async (
  queryParam: Partial<ISchools> | any,
  selectOptions: Array<keyof Schools>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Schools[]> => {
  return t
    ? t.manager.find(Schools, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
        order: { created_at: 'DESC' },
      })
    : getRepository(Schools).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
        order: { created_at: 'DESC' },
      });
};

export const saveSchoolsREPO = (queryParams: Partial<ISchools>, transaction?: QueryRunner): Promise<any> => {
  const { slug, ...rest } = queryParams;
  const payload = {
    code: `scl_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    slug: slug || `${randomstring.generate({ length: 10, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...rest,
  };
  return transaction ? transaction.manager.save(Schools, payload) : getRepository(Schools).save(payload);
};

export const updateSchool = (queryParams: Pick<ISchools, 'id'>, updateFields: Partial<ISchools>, t?: QueryRunner): Promise<UpdateResult> => {
  return t ? t.manager.update(Schools, queryParams, updateFields) : getRepository(Schools).update(queryParams, updateFields);
};
