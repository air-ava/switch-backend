import randomstring from 'randomstring';
import { QueryRunner, getRepository, In, UpdateResult } from 'typeorm';
import { IStudentGuardian } from '../modelInterfaces';
import { StudentGuardian } from '../models/studentGuardian.model';

export const getStudentGuardian = async (
  queryParam: Partial<IStudentGuardian> | any,
  selectOptions: Array<keyof StudentGuardian>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<StudentGuardian | undefined> => {
  return t
    ? t.manager.findOne(StudentGuardian, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(StudentGuardian).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listStudentGuardian = async (
  queryParam: Partial<IStudentGuardian> | any,
  selectOptions: Array<keyof StudentGuardian>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<StudentGuardian[]> => {
  return t
    ? t.manager.find(StudentGuardian, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(StudentGuardian).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const saveStudentGuardianREPO = (
  queryParams: Partial<IStudentGuardian> | Partial<IStudentGuardian>[] | any,
  transaction?: QueryRunner,
): Promise<any> => {
  const payload = {
    code: `stg_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return transaction ? transaction.manager.save(StudentGuardian, payload) : getRepository(StudentGuardian).save(payload);
};

export const updateStudentGuardian = (
  queryParams: Pick<IStudentGuardian, 'id'>,
  updateFields: Partial<IStudentGuardian>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(StudentGuardian, queryParams, updateFields) : getRepository(StudentGuardian).update(queryParams, updateFields);
};
