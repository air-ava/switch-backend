import { QueryRunner, getRepository, In, UpdateResult } from 'typeorm';
import { IStudentClass } from '../modelInterfaces';
import { StudentClass } from '../models/studentClass.model';

export const getStudentClass = async (
  queryParam: Partial<IStudentClass> | any,
  selectOptions: Array<keyof StudentClass>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<StudentClass | undefined> => {
  return t
    ? t.manager.findOne(StudentClass, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(StudentClass).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listStudentClass = async (
  queryParam: Partial<IStudentClass> | any,
  selectOptions: Array<keyof StudentClass>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<StudentClass[]> => {
  return t
    ? t.manager.find(StudentClass, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(StudentClass).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveStudentClassREPO = (
  queryParams: Partial<IStudentClass> | Partial<IStudentClass>[] | any,
  transaction?: QueryRunner,
): Promise<any> => {
  return transaction ? transaction.manager.save(StudentClass, queryParams) : getRepository(StudentClass).save(queryParams);
};

export const updateStudentClass = (
  queryParams: Partial<IStudentClass>,
  updateFields: Partial<IStudentClass>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(StudentClass, queryParams, updateFields) : getRepository(StudentClass).update(queryParams, updateFields);
};
