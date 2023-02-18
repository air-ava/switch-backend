import { QueryRunner, getRepository, UpdateResult } from 'typeorm';
import { Documents } from '../models/document.model';
import { IDocuments } from '../modelInterfaces';

export const Repo = {
  async listDocuments(
    queryParam: Partial<IDocuments> | any,
    selectOptions: Array<keyof Documents>,
    relationOptions?: any[],

    t?: QueryRunner,
  ): Promise<Documents[]> {
    return t
      ? t.manager.find(Documents, {
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        })
      : getRepository(Documents).find({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        });
  },

  async saveDocuments(payload: Partial<IDocuments>, t?: QueryRunner): Promise<Documents> {
    const { ...rest } = payload;
    return t ? t.manager.save(Documents, rest) : getRepository(Documents).save(rest);
  },

  async updateDocuments(queryParams: Partial<IDocuments>, updateFields: Partial<IDocuments>, t?: QueryRunner): Promise<UpdateResult> {
    return t ? t.manager.update(Documents, queryParams, updateFields) : getRepository(Documents).update(queryParams, updateFields);
  },
};