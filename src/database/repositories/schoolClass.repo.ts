/* eslint-disable no-param-reassign */
import randomstring from 'randomstring';
import { QueryRunner, getRepository, In, UpdateResult } from 'typeorm';
import { ISchoolClass } from '../modelInterfaces';
import { SchoolClass } from '../models/schoolClass.model';
import { StudentClass } from '../models/studentClass.model';
import Utils from '../../utils/utils';

export const getSchoolClass = async (
  queryParam: Partial<ISchoolClass> | any,
  selectOptions: Array<keyof SchoolClass>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<SchoolClass | undefined> => {
  return t
    ? t.manager.findOne(SchoolClass, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(SchoolClass).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listSchoolClass = async (
  queryParam: Partial<ISchoolClass> | any,
  selectOptions: Array<keyof SchoolClass>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<SchoolClass[]> => {
  return t
    ? t.manager.find(SchoolClass, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(SchoolClass).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const listStundentsInSchoolClass = async (
  queryParam: { schoolId: number; classId: number; status: number; perPage?: any; cursor?: any },
  selectOptions: Array<keyof StudentClass>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<StudentClass[] | any> => {
  const repository = t ? t.manager.getRepository(StudentClass) : getRepository(StudentClass);
  const { schoolId, classId, status, perPage = 20, cursor } = queryParam;

  const payload = {
    classId,
    status,
    student: {
      status,
      schoolId,
    },
  };
  const { order, query } = Utils.paginationOrderAndCursor(Number(cursor), payload);

  if (!relationOptions) relationOptions = [];
  relationOptions.push('student');

  const [students, total] = await Promise.all([
    repository.find({
      where: query,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
      order,
      take: parseInt(perPage, 10),
    }),
    repository.count({ where: payload, ...(relationOptions && { relations: relationOptions }) }),
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

export const getSchoolClassDetails = async (queryParams: any, transaction?: QueryRunner): Promise<any> => {
  const { classId, schoolId, groupingInterval } = queryParams;
  const queryBuilder = getRepository(StudentClass).createQueryBuilder('studentClass');
  const mainQuery = queryBuilder
    .leftJoinAndSelect('studentClass.Student', 'Student')
    .leftJoinAndSelect('Student.User', 'User')
    .leftJoinAndSelect('Student.Fees', 'Fees')
    .leftJoinAndSelect('Fees.Fee', 'Fee')
    .leftJoinAndSelect('Fees.FeesHistory', 'PaymentHistory')
    .select('SUM(Student.id)', 'totalStudent')
    .addSelect('SUM(CASE WHEN User.gender = :male THEN 1 ELSE 0 END)', 'totalMale')
    .addSelect('SUM(CASE WHEN User.gender = :female THEN 1 ELSE 0 END)', 'totalFemale')
    .addSelect('SUM(Fees.amount_outstanding)', 'totalOutstanding')
    .addSelect('SUM(Fees.amount_paid)', 'totalPaid')
    .addSelect('SUM(PaymentHistory.amount)', 'sumPaid')
    .addSelect('SUM(Fee.amount)', 'totalFees')
    .where('studentClass.status = :status AND Student.status = :status AND Student.schoolId = :schoolId AND studentClass.classId = :classId', {
      status: 1,
      schoolId,
      classId,
      female: 'female',
      male: 'male',
    })
    .getRawOne();

  // Validate and apply dynamic grouping
  const groupingColumns: string[] = [];
  const selectingColumns: string[] = [];

  const groupQuery = {
    year: 'YEAR(FeesHistory.created_at)',
    month: 'MONTH(FeesHistory.created_at)',
    week: 'WEEK(FeesHistory.created_at)',
    day: 'DATE(FeesHistory.created_at)',
  };

  switch (groupingInterval) {
    case 'year':
      groupingColumns.push(groupQuery.year);
      selectingColumns.push(`${groupQuery.year}  as year`);
      break;
    case 'month':
      groupingColumns.push(groupQuery.year, groupQuery.month);
      selectingColumns.push(`${groupQuery.year}  as year`, `${groupQuery.month} as month`);
      // groupingColumns.push("DATE_FORMAT(transaction.created_at, '%Y-%m)");
      break;
    case 'week':
      groupingColumns.push(groupQuery.year, `${groupQuery.week}`);
      selectingColumns.push(`${groupQuery.year}  as year`, `${groupQuery.week} as week`);
      // groupingColumns.push('YEARWEEK(FeesHistory.created_at)');
      break;
    case 'day':
      groupingColumns.push(groupQuery.day);
      selectingColumns.push(`${groupQuery.day}  as day`);
      break;
    default:
      throw new Error('Invalid grouping interval. Supported values: year, month, week, day.');
  }
  
  const groupingQuery = queryBuilder
    .leftJoinAndSelect('studentClass.Student', 'StudentGrouped')
    .leftJoinAndSelect('StudentGrouped.Fees', 'FeesRecord')
    .leftJoinAndSelect('FeesRecord.FeesHistory', 'FeesHistory')
    .select([
      'SUM(FeesHistory.amount) as sumPaid',
      'COUNT(FeesHistory.id) as totalPaid',
      'MIN(FeesHistory.outstanding_after) as sumOutstanding',
      ...selectingColumns,
    ])
    .where(
      'studentClass.status = :status AND StudentGrouped.status = :status AND StudentGrouped.schoolId = :schoolId AND studentClass.classId = :classId',
      {
        status: 1,
        schoolId,
        classId,
      },
    )
    .groupBy(groupingColumns.join(','))
    .getRawMany();

  const [mainData, groupedData] = await Promise.all([mainQuery, groupingQuery]);

  return { ...mainData, groupedData };
};

export const saveSchoolClass = (queryParams: Partial<ISchoolClass> | Partial<ISchoolClass>[] | any, transaction?: QueryRunner): Promise<any> => {
  const payload = {
    code: `shc_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return transaction ? transaction.manager.save(SchoolClass, payload) : getRepository(SchoolClass).save(payload);
};

export const updateSchoolClass = (
  queryParams: Pick<ISchoolClass, 'id'>,
  updateFields: Partial<ISchoolClass>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(SchoolClass, queryParams, updateFields) : getRepository(SchoolClass).update(queryParams, updateFields);
};
