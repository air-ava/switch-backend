/* eslint-disable no-param-reassign */
import randomstring from 'randomstring';
import { QueryRunner, getRepository, In, UpdateResult } from 'typeorm';
import { ISchoolClass } from '../modelInterfaces';
import { SchoolClass } from '../models/schoolClass.model';
import { StudentClass } from '../models/studentClass.model';
import Utils, { isValidDate } from '../../utils/utils';
import exp from 'constants';
import { STATUSES } from '../models/status.model';

const dateFns = require('date-fns');

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
): Promise<SchoolClass[] | any> => {
  const repository = t ? t.manager.getRepository(SchoolClass) : getRepository(SchoolClass);
  const classes = await repository.find({
    where: queryParam,
    ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
    ...(relationOptions && { relations: relationOptions }),
  });

  classes.forEach((classRoom: any) => {
    // eslint-disable-next-line no-return-assign
    const amountPaid = classRoom.Fees && classRoom.Fees.reduce((sum: any, fee: any) => (sum += +fee.amount), 0);
    const { currency } = classRoom.Fees[0] || { currency: 'UGX' };
    classRoom.totalFee = amountPaid;
    classRoom.currency = currency;
    classRoom.studentCount = classRoom.School.Students.length;
  });

  return classes;
};

export const listStundentsInSchoolClass = async (
  queryParam: any,
  selectOptions: Array<any>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<StudentClass[] | any> => {
  const repository = t ? t.manager.getRepository(StudentClass) : getRepository(StudentClass);
  const { schoolId, classId, status, page = 1, perPage = 20, from, to } = queryParam;

  const payload = {
    classId,
    status,
    student: {
      status,
      schoolId,
    },
  };

  //! cursor pagination
  // const { order, query } = Utils.paginationOrderAndCursor(Number(cursor), payload);
  const { offset, query } = Utils.paginationRangeAndOffset({ page, from, to, perPage, query: payload });
  const order: any = { created_at: 'DESC' };

  if (!relationOptions) relationOptions = [];
  relationOptions.push('student');
  // selectOptions.push('SUM(student.Fees.amount_paid) as totalAmountPaid');

  const [students, total] = await Promise.all([
    repository.find({
      where: query,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
      order,
      take: parseInt(perPage, 10),
      skip: offset,
      // group: ['currency'],
    }),
    repository.count({ where: query, ...(relationOptions && { relations: relationOptions }) }),
  ]);

  // Calculate the sum of 'amount_paid' for each student and add it to the 'students' array
  students.forEach((student: any) => {
    const amountPaid =
      student.student.Fees &&
      student.student.Fees.reduce(
        (sum: any, fee: any) => {
          sum.totalFee += +fee.Fee.amount;
          sum.totalAmountPaid += +fee.amount_paid;
          sum.totalAmountOutstanding += +fee.amount_outstanding;
          if (!sum.lastPaymentDate || fee.created_at > sum.lastPaymentDate) {
            sum.lastPaymentDate = fee.created_at;
          }
          return sum;
        },
        {
          totalAmountPaid: 0,
          totalAmountOutstanding: 0,
          totalFee: 0,
        },
      );
    const { beneficiary_type, product_currency, ...rest } = student.student.Fees[0] || {
      beneficiary_type: 'student',
      product_currency: 'UGX',
    };
    const { totalAmountPaid, totalAmountOutstanding, totalFee } = amountPaid;
    let paidStatus;
    if (totalAmountPaid < totalAmountOutstanding) paidStatus = 'Part payment';
    if (totalAmountPaid === totalAmountOutstanding) paidStatus = 'Paid';
    if (totalAmountPaid === 0) paidStatus = 'Outstanding';
    student.student.fee = {
      paidStatus,
      ...amountPaid,
      beneficiary_type,
      product_currency,
    };
  });

  //! cursor pagination
  // const { hasMore, newCursor, previousCursor } = Utils.paginationMetaCursor({ responseArray: students, perPage, cursor });
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

export const getSchoolClassDetails = async (queryParams: any, transaction?: QueryRunner): Promise<any> => {
  const { classId, schoolId, groupingInterval } = queryParams;
  const queryBuilder = getRepository(StudentClass).createQueryBuilder('studentClass');
  return queryBuilder
    .leftJoinAndSelect('studentClass.Student', 'Student')
    .leftJoinAndSelect('Student.User', 'User')
    .leftJoinAndSelect('Student.Fees', 'Fees')
    .leftJoinAndSelect('Fees.Fee', 'Fee')
    .leftJoinAndSelect('Fees.FeesHistory', 'PaymentHistory')
    .select('COUNT(*)', 'totalStudent')
    .addSelect('SUM(CASE WHEN User.gender = :male THEN 1 ELSE 0 END)', 'totalMale')
    .addSelect('SUM(CASE WHEN User.gender = :female THEN 1 ELSE 0 END)', 'totalFemale')
    .addSelect('SUM(Fees.amount_outstanding)', 'totalOutstanding')
    .addSelect('SUM(Fees.amount_paid)', 'totalPaid')
    .addSelect('SUM(Fee.amount)', 'totalFees')
    .addSelect('Fee.currency', 'currency')
    .where('studentClass.status = :status AND Student.status = :status AND Student.schoolId = :schoolId AND studentClass.classId = :classId', {
      status: 1,
      schoolId,
      classId,
      female: 'female',
      male: 'male',
    })
    .groupBy('Fee.currency')
    .getRawMany();
};

export const getClassAnalytics = async (queryParams: any, transaction?: QueryRunner): Promise<any> => {
  const { classId, schoolId, groupingInterval = 'weekly' } = queryParams;
  let { from, to } = queryParams;
  const queryBuilder = getRepository(StudentClass).createQueryBuilder('studentClass');
  // Validate and apply dynamic grouping
  let groupingColumns: string;
  let selectingColumns: string;

  const today = new Date();
  from = dateFns.subDays(today, 100).toISOString();
  to = today.toISOString();

  const groupQuery = {
    year: 'YEAR(FeesHistory.created_at)',
    month: "DATE_FORMAT(FeesHistory.created_at, '%Y-%m')",
    week: 'YEARWEEK(FeesHistory.created_at)',
    day: 'DATE(FeesHistory.created_at)',
  };

  switch (groupingInterval) {
    case 'yearly':
      groupingColumns = groupQuery.year;
      selectingColumns = `${groupQuery.year}`;
      break;
    case 'monthly':
      groupingColumns = groupQuery.month;
      selectingColumns = `${groupQuery.month}`;
      // groupingColumns = "DATE_FORMAT(transaction.created_at, '%Y-%m)";
      break;
    case 'weekly':
      groupingColumns = `${groupQuery.week}`;
      selectingColumns = `${groupQuery.week}`;
      // groupingColumns = 'YEARWEEK(FeesHistory.created_at)';
      break;
    case 'daily':
      groupingColumns = groupQuery.day;
      selectingColumns = `${groupQuery.day}`;
      break;
    default:
      throw new Error('Invalid grouping interval. Supported values: yearly, monthly, weekly, daily');
  }

  const query = queryBuilder
    .leftJoinAndSelect('studentClass.Student', 'StudentGrouped')
    .leftJoinAndSelect('StudentGrouped.Fees', 'FeesRecord')
    .leftJoinAndSelect('FeesRecord.FeesHistory', 'FeesHistory')
    .select(selectingColumns, 'date')
    .addSelect('SUM(FeesHistory.amount)', 'sumPaid')
    .addSelect('COUNT(FeesHistory.id)', 'transactionCount')
    .addSelect('MIN(FeesHistory.outstanding_after)', 'sumOutstanding')
    .where(
      'studentClass.status = :status AND StudentGrouped.status = :status AND StudentGrouped.schoolId = :schoolId AND studentClass.classId = :classId',
      {
        status: 1,
        schoolId,
        classId,
      },
    );

  if (from || to) {
    if (from && isValidDate(from)) query.andWhere(`FeesHistory.created_at >= '${from}'`);
    if (to && isValidDate(to)) query.andWhere(`FeesHistory.created_at <= '${to}'`);
  }

  const analytics = await query.groupBy(groupingColumns).addGroupBy('FeesRecord.product_currency').getRawMany();
  return analytics;
};

export const saveSchoolClass = (queryParams: Partial<ISchoolClass> | Partial<ISchoolClass>[] | any, transaction?: QueryRunner): Promise<any> => {
  const payload = {
    code: `shc_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    ...queryParams,
  };
  return transaction ? transaction.manager.save(SchoolClass, payload) : getRepository(SchoolClass).save(payload);
};

export const listFeesByClass = async (
  queryParams: any,
  selectOptions: Array<keyof SchoolClass> = [],
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<any> => {
  const { currency, page = 1, perPage = 20, from, to, ...rest } = queryParams;
  const repository = transaction ? transaction.manager.getRepository(SchoolClass) : getRepository(SchoolClass);

  const { offset, query } = Utils.paginationRangeAndOffset({ page, from, to, perPage, query: rest });
  const order: any = { created_at: 'DESC' };

  const [classes, total] = await Promise.all([
    repository.find({
      where: query,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
      order,
      take: parseInt(perPage, 10),
      skip: offset,
    }),
    repository.count({ where: query, ...(relationOptions && { relations: relationOptions }) }),
  ]);
  classes.forEach((classRoom: any) => {
    classRoom.Fees = classRoom.Fees.filter((fee: any) => fee.status === STATUSES.ACTIVE && fee.currency === currency);
    classRoom.currency = currency;
    const calculatedFees =
      classRoom.Fees &&
      classRoom.Fees.reduce(
        (sum: any, fee: any) => {
          if (fee.feature_name === 'tuition-fees') sum.tuitionFee += +fee.amount;
          else sum.otherFees += +fee.amount;
          return sum;
        },
        {
          tuitionFee: 0,
          otherFees: 0,
        },
      );
    classRoom.tuitionFee = calculatedFees.tuitionFee;
    classRoom.otherFees = calculatedFees.otherFees;
  });

  const { nextPage, totalPages, hasNextPage, hasPreviousPage } = Utils.paginationMetaOffset({ total, perPage, page });
  return {
    classes,
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

export const getFeesByClass = async (
  queryParams: any,
  selectOptions: Array<keyof SchoolClass> = [],
  relationOptions?: any[],
  transaction?: QueryRunner,
): Promise<any> => {
  const { currency, ...rest } = queryParams;
  const repository = transaction ? transaction.manager.getRepository(SchoolClass) : getRepository(SchoolClass);
  const classRoom = await repository.findOne({
    where: rest,
    ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
    ...(relationOptions && { relations: relationOptions }),
  });
  (classRoom as any).Fees = (classRoom as any).Fees.filter((fee: any) => fee.status === STATUSES.ACTIVE && fee.currency === currency);
  return classRoom;
};

export const updateSchoolClass = (
  queryParams: Pick<ISchoolClass, 'id'>,
  updateFields: Partial<ISchoolClass>,
  t?: QueryRunner,
): Promise<UpdateResult> => {
  return t ? t.manager.update(SchoolClass, queryParams, updateFields) : getRepository(SchoolClass).update(queryParams, updateFields);
};
