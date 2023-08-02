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
  const { page = 1, perPage = 20, from, to, ...rest } = queryParam;

  //! cursor pagination
  // const { order, query } = Utils.paginationOrderAndCursor(cursor, rest);
  const { offset, query } = Utils.paginationRangeAndOffset({ page, from, to, perPage, query: rest });
  const order: any = { created_at: 'DESC' };

  const repository = t ? t.manager.getRepository(Student) : getRepository(Student);
  const [students, total] = await Promise.all([
    repository.find({
      where: query,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
      order,
      take: parseInt(perPage, 10),
      skip: offset,
    }),
    repository.count({ where: rest }),
  ]);

  //! cursor pagination
  // const { hasMore, newCursor } = Utils.paginationMetaCursor({ responseArray: students, perPage });
  const { nextPage, totalPages, hasNextPage, hasPreviousPage } = Utils.paginationMetaOffset({ total, perPage, page });

  return {
    students,
    meta: {
      total,
      perPage,
      currentPage: page,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      nextPage,
    },
  };
};

export const saveStudentREPO = (queryParams: Partial<IStudent> | Partial<IStudent>[] | any, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(Student, queryParams) : getRepository(Student).save(queryParams);
};

export const updateStudent = (queryParams: Pick<IStudent, 'id'>, updateFields: Partial<IStudent>, t?: QueryRunner): Promise<UpdateResult> => {
  return t ? t.manager.update(Student, queryParams, updateFields) : getRepository(Student).update(queryParams, updateFields);
};
