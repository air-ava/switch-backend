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
    const repository = t ? t.manager.getRepository(DocumentRequirement) : getRepository(DocumentRequirement);
    return repository.find({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },
};
