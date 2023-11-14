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
    const repository = t ? t.manager.getRepository(Documents) : getRepository(Documents);
    return repository.find({
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
    const repository = t ? t.manager.getRepository(Documents) : getRepository(Documents);
    return repository.findOne({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async saveDocuments(payload: Partial<IDocuments>, t?: QueryRunner): Promise<Documents> {
    const { ...rest } = payload;
    // return t ? t.manager.save(Documents, rest) : getRepository(Documents).save(rest);
    // code: `doc_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
    const repository = t ? t.manager.getRepository(Documents) : getRepository(Documents);
    const body = { ...rest };
    return repository.save(body);
  },

  async updateDocuments(queryParams: Partial<IDocuments | any>, updateFields: Partial<IDocuments>, t?: QueryRunner): Promise<UpdateResult> {
    const repository = t ? t.manager.getRepository(Documents) : getRepository(Documents);
    return repository.update(queryParams, updateFields);
  },

  // verifyDocuments(queryParams: Partial<IDocuments>, updateFields: Partial<IDocuments>, t?: QueryRunner): Promise<UpdateResult> {
  //   return t ? t.manager.update(Documents, queryParams, updateFields) : getRepository(Documents).update(queryParams, updateFields);
  // },
};

export default Repo;
