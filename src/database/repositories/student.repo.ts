import { QueryRunner, getRepository, In, UpdateResult } from 'typeorm';
import { IStudent } from '../modelInterfaces';
import { Student } from '../models/student.model';

export const getStudent = async (
  queryParam: Partial<IStudent> | any,
  selectOptions: Array<keyof Student>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Student | undefined> => {
  return t
    ? t.manager.findOne(Student, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Student).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listStudent = async (
  queryParam: Partial<IStudent> | any,
  selectOptions: Array<keyof Student>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Student[]> => {
  return t
    ? t.manager.find(Student, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
        order: { created_at: 'DESC' },
      })
    : getRepository(Student).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
        order: { created_at: 'DESC' },
      });
};

export const saveStudentREPO = (queryParams: Partial<IStudent> | Partial<IStudent>[] | any, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(Student, queryParams) : getRepository(Student).save(queryParams);
};

export const updateStudent = (queryParams: Pick<IStudent, 'id'>, updateFields: Partial<IStudent>, t?: QueryRunner): Promise<UpdateResult> => {
  return t ? t.manager.update(Student, queryParams, updateFields) : getRepository(Student).update(queryParams, updateFields);
};
