import { QueryRunner, getRepository } from 'typeorm';
import { IQuestionnaireTitle } from '../modelInterfaces';
import { QuestionnaireTitle } from '../models/questionnaireTitle.model';

export const listQuestionnaire = async (
  queryParam: Partial<IQuestionnaireTitle> | any,
  selectOptions: Array<keyof QuestionnaireTitle>,
  relationOptions?: any[],

  t?: QueryRunner,
): Promise<QuestionnaireTitle[]> => {
  return t
    ? t.manager.find(QuestionnaireTitle, {
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      })
    : getRepository(QuestionnaireTitle).find({
        where: queryParam,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        ...(relationOptions && { relations: relationOptions }),
      });
};
