import { QueryRunner, getRepository } from 'typeorm';
import { IQuestionnaire } from '../modelInterfaces';
import { Questionnaire } from '../models/questionnaire.model';

// export const listSchools = async (
//   queryParam: Partial<IQuestionnaire> | any,
//   selectOptions: Array<keyof Questionnaire>,
//   relationOptions?: any[],

//   t?: QueryRunner,
// ): Promise<Questionnaire[]> => {
//   return t
//     ? t.manager.find(Questionnaire, {
//         where: queryParam,
//         ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
//         ...(relationOptions && { relations: relationOptions }),
//       })
//     : getRepository(Questionnaire).find({
//         where: queryParam,
//         ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
//         ...(relationOptions && { relations: relationOptions }),
//       });
// };

export const findQuestionnaire = async (
  queryParam: Partial<IQuestionnaire> | any,
  selectOptions: Array<keyof Questionnaire>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Questionnaire | undefined> => {
  return t
    ? t.manager.findOne(Questionnaire, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Questionnaire).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};

export const answerQuestionnaire = (queryParams: Partial<IQuestionnaire>, transaction?: QueryRunner): Promise<any> => {
  return transaction ? transaction.manager.save(Questionnaire, queryParams) : getRepository(Questionnaire).save(queryParams);
};
