import { QueryRunner, getRepository, In, UpdateResult, LessThan, MoreThan } from 'typeorm';
import { IStudent } from '../modelInterfaces';
import { Student } from '../models/student.model';
import Utils from '../../utils/utils';

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
): Promise<{ students: Student[]; meta: any }> => {
  const { perPage = 20, cursor, ...rest } = queryParam;
  const { order, query } = Utils.paginationOrderAndCursor(cursor, rest);

  const repository = t ? t.manager.getRepository(Student) : getRepository(Student);
  const [students, total] = await Promise.all([
    repository.find({
      where: query,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
      order,
      take: parseInt(perPage, 10),
    }),
    repository.count({ where: rest }),
  ]);
  const { hasMore, newCursor } = Utils.paginationMeta({ responseArray: students, perPage });

  return {
    students,
    meta: {
      total,
      perPage,
      hasMore,
      cursor: newCursor,
    },
  };
};

export const saveStudentREPO = (queryParams: Partial<IStudent> | Partial<IStudent>[] | any, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(Student, queryParams) : getRepository(Student).save(queryParams);
};

export const updateStudent = (queryParams: Pick<IStudent, 'id'>, updateFields: Partial<IStudent>, t?: QueryRunner): Promise<UpdateResult> => {
  return t ? t.manager.update(Student, queryParams, updateFields) : getRepository(Student).update(queryParams, updateFields);
};
