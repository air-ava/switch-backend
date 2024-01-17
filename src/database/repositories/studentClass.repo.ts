import { QueryRunner, getRepository, In, UpdateResult } from 'typeorm';
import { IStudentClass } from '../modelInterfaces';
import { StudentClass } from '../models/studentClass.model';
import randomstring from 'randomstring';

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
  const repository = transaction ? transaction.manager.getRepository(StudentClass) : getRepository(StudentClass);
  const payload = {
    code: `stc_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return repository.save(payload);
};

export const updateStudentClass = (
  queryParams: Partial<IStudentClass>,
  updateFields: Partial<IStudentClass>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(StudentClass, queryParams, updateFields) : getRepository(StudentClass).update(queryParams, updateFields);
};

export const listStundentsInSchoolClass = async (
  queryParam: Partial<StudentClass> | any,
  selectOptions: Array<keyof StudentClass>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<StudentClass[]> => {
  const repository = t ? t.manager.getRepository(StudentClass) : getRepository(StudentClass);
  const { schoolId, classId, status } = queryParam;
  return repository.find({
    where: {
      classId,
      status,
      student: {
        status,
        School: {
          id: schoolId,
        },
      },
    },
    ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
    ...(relationOptions && { relations: relationOptions || ['student', 'student.School'] }),
  });
};
