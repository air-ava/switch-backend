/* eslint-disable default-case */
/* eslint-disable no-restricted-syntax */
import { QueryRunner, getRepository, UpdateResult } from 'typeorm';
import { Status } from '../models/status.model';
import { Documents } from '../models/document.model';
import { Assets } from '../models/assets.model';
import { IDocuments } from '../modelInterfaces';

export const Repo = {
  // async listDocuments(
  //   queryParam: Partial<IDocuments> | any,
  //   selectOptions: Array<keyof Documents>,
  //   relationOptions?: any[],
  //   t?: QueryRunner,
  // ): Promise<Documents[] | any[] | any> {
  //   const repository = t ? t.manager.getRepository(Documents) : getRepository(Documents);
  //   const { addTargetEntity = false, ...rest } = queryParam;
  //   const documents = await repository.find({
  //     where: rest,
  //     ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
  //     ...(relationOptions && { relations: relationOptions }),
  //     order: { created_at: 'DESC' },
  //   });

  //   if (addTargetEntity) {
  //     const enhancedDocuments = [];
  //     for (const doc of documents) {
  //       const query = repository.createQueryBuilder('documents');

  //       // Add conditions for each referenced_entity
  //       switch (doc.referenced_entity) {
  //         case 'school':
  //           query.innerJoinAndSelect('documents.School', 'school');
  //           break;
  //         case 'organisations':
  //           query.innerJoinAndSelect('documents.Organisation', 'organisations');
  //           break;
  //         case 'transactions':
  //           query.innerJoinAndSelect('documents.Transactions', 'transactions');
  //           break;
  //         case 'individual':
  //           query.innerJoinAndSelect('documents.Individual', 'individual');
  //           break;
  //         case 'bankTransfer':
  //           query.innerJoinAndSelect('documents.BankTransfer', 'bankTransfer');
  //           break;
  //       }

  //       if (relationOptions && relationOptions.length)
  //         relationOptions.forEach((relation) => {
  //           query.leftJoinAndSelect(`documents.${relation}`, relation);
  //         });

  //       // Fetch the enhanced document with the correct join
  //       // eslint-disable-next-line no-await-in-loop
  //       const enhancedDoc = await query.where({ id: doc.id }).getOne();
  //       if (enhancedDoc) enhancedDocuments.push(enhancedDoc);
  //     }
  //     return enhancedDocuments;
  //   }

  //   return documents;
  // },

  async listDocuments(
    queryParam: Partial<IDocuments> | any,
    selectOptions: Array<keyof Documents>,
    relationOptions: string[] = [],
    t?: QueryRunner,
  ): Promise<Documents[] | any[] | any> {
    const repository = t ? t.manager.getRepository(Documents) : getRepository(Documents);
    const { addTargetEntity = false, ...rest } = queryParam;

    if (!addTargetEntity) {
      // Fetch documents without additional joins
      return repository.find({
        where: rest,
        ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
        relations: relationOptions,
        order: { created_at: 'DESC' },
      });
    }

    // If addTargetEntity is true, use createQueryBuilder for more complex query
    const query = repository.createQueryBuilder('documents');

    // Select fields
    if (selectOptions.length) {
      query.select(selectOptions.map((option) => `documents.${option}`));
      query.addSelect('documents.id'); // Always include the id
    }

    // Add relation joins
    relationOptions.forEach((relation) => {
      query.leftJoinAndSelect(`documents.${relation}`, relation);
    });

    // Add additional dynamic joins based on referenced_entity
    // Note: This assumes a certain structure and naming convention.
    // You might need to adjust the logic based on your actual database schema.
    query
      .leftJoinAndSelect('documents.School', 'school')
      .leftJoinAndSelect('documents.Organisation', 'organisations')
      .leftJoinAndSelect('documents.Transaction', 'transactions')
      .leftJoinAndSelect('documents.Individual', 'individual')
      .leftJoinAndSelect('documents.BankTransfer', 'bankTransfer');

    // Apply where conditions
    query.where(rest);

    // Apply ordering
    query.orderBy('documents.created_at', 'DESC');

    // Execute the query
    return query.getMany();
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
