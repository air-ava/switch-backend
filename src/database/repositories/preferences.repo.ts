import randomstring from 'randomstring';
import { QueryRunner, getRepository, UpdateResult } from 'typeorm';
import { Preference } from '../models/preferences.model';

export const getPreference = async (
  queryParam: Partial<Preference> | any,
  selectOptions: Array<keyof Preference>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Preference | undefined> => {
  const repository = t ? t.manager.getRepository(Preference) : getRepository(Preference);
  return repository.findOne({
    where: queryParam,
    select: selectOptions.length ? [...selectOptions, 'id'] : undefined,
    relations: relationOptions,
  });
};

export const listPreferences = async (
  queryParam: Partial<Preference> | any,
  selectOptions: Array<keyof Preference>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Preference[]> => {
  const repository = t ? t.manager.getRepository(Preference) : getRepository(Preference);
  return repository.find({
    where: queryParam,
    select: selectOptions.length ? [...selectOptions, 'id'] : undefined,
    relations: relationOptions,
  });
};

export const createPreference = async (queryParams: Partial<Preference> | Partial<Preference>[] | any, t?: QueryRunner): Promise<any> => {
  const repository = t ? t.manager.getRepository(Preference) : getRepository(Preference);
  const payload = {
    code: `prf_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return repository.save(payload);
};

export const updatePreference = async (
  queryParams: Pick<Preference, 'id'>,
  updateFields: Partial<Preference> | any,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  const repository = t ? t.manager.getRepository(Preference) : getRepository(Preference);
  return repository.update(queryParams, updateFields);
};
