import randomstring from 'randomstring';
import { QueryRunner, getRepository, In, UpdateResult } from 'typeorm';
import { ISchedule } from '../modelInterfaces';
import { Schedule } from '../models/schedule.model';

export const getSchedule = async (
  queryParam: Partial<ISchedule> | any,
  selectOptions: Array<keyof Schedule>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Schedule | undefined> => {
  return t
    ? t.manager.findOne(Schedule, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Schedule).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listSchedule = async (
  queryParam: Partial<ISchedule> | any,
  selectOptions: Array<keyof Schedule>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Schedule[]> => {
  return t
    ? t.manager.find(Schedule, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(Schedule).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveSchedule = (queryParams: Partial<ISchedule> | Partial<ISchedule>[] | any, transaction?: QueryRunner): Promise<any> => {
  const payload = {
    code: `sch_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return transaction ? transaction.manager.save(Schedule, payload) : getRepository(Schedule).save(payload);
};

export const updateSchedule = (queryParams: Pick<ISchedule, 'id'>, updateFields: Partial<ISchedule>, t?: QueryRunner): Promise<UpdateResult> => {
  return t ? t.manager.update(Schedule, queryParams, updateFields) : getRepository(Schedule).update(queryParams, updateFields);
};
