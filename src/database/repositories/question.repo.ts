import { QueryRunner, getRepository } from 'typeorm';
import { IQuestions } from '../modelInterfaces';
import { Questions } from '../models/questions.model';

export const getQuestion = async (
  queryParam: Partial<IQuestions> | any,
  selectOptions: Array<keyof Questions>,
  relationOptions?: any[],
  t?: QueryRunner,
): Promise<Questions | undefined> => {
  return t
    ? t.manager.findOne(Questions, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      })
    : getRepository(Questions).findOne({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};
