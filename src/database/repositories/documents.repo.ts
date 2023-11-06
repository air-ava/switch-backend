import { Status } from './../models/status.model';
import { QueryRunner, getRepository, UpdateResult } from 'typeorm';
import { Documents } from '../models/document.model';
import { Assets } from '../models/assets.model';
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
          order: { created_at: 'DESC' },
        })
      : getRepository(Documents).find({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
          order: { created_at: 'DESC' },
        });
  },

  async getDocumentLogs(
    queryParam: Partial<IDocuments> | any,
    selectOptions: Array<keyof Documents>,
    relationOptions?: any[],
    t?: QueryRunner,
  ): Promise<Documents[]> {
    return getRepository(Documents)
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.Assets', 'Asset')
      .leftJoinAndSelect('document.Status', 'Status')
      .getMany();
  },

  async findDocument(
    queryParam: Partial<IDocuments | any>,
    selectOptions: Array<keyof Documents>,
    relationOptions?: any[],
    t?: QueryRunner,
  ): Promise<Documents | undefined | any> {
    return t
      ? t.manager.findOne(Documents, {
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        })
      : getRepository(Documents).findOne({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
          ...(relationOptions && { relations: relationOptions }),
        });
  },

  async saveDocuments(payload: Partial<IDocuments>, t?: QueryRunner): Promise<Documents> {
    const { ...rest } = payload;
    return t ? t.manager.save(Documents, rest) : getRepository(Documents).save(rest);
  },

  async updateDocuments(queryParams: Partial<IDocuments | any>, updateFields: Partial<IDocuments>, t?: QueryRunner): Promise<UpdateResult> {
    return t ? t.manager.update(Documents, queryParams, updateFields) : getRepository(Documents).update(queryParams, updateFields);
  },

  // verifyDocuments(queryParams: Partial<IDocuments>, updateFields: Partial<IDocuments>, t?: QueryRunner): Promise<UpdateResult> {
  //   return t ? t.manager.update(Documents, queryParams, updateFields) : getRepository(Documents).update(queryParams, updateFields);
  // },
};
