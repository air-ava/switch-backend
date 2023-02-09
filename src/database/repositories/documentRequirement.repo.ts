import { QueryRunner, getRepository } from 'typeorm';
import { IDocumentRequirement } from '../modelInterfaces';
import { DocumentRequirement } from '../models/documentRequirement.model';

export const Repo = {
  async listDocumentRequirements(
    queryParam: Partial<IDocumentRequirement> | any,
    selectOptions: Array<keyof DocumentRequirement>,
    relationOptions?: any[],

    t?: QueryRunner,
  ): Promise<DocumentRequirement[]> {
    return t
      ? t.manager.find(DocumentRequirement, {
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        })
      : getRepository(DocumentRequirement).find({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        });
  },
};
