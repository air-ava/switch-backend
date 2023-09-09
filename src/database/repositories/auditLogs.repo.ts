import { EntityRepository, QueryRunner, SelectQueryBuilder, getRepository, UpdateResult } from 'typeorm';
import randomstring from 'randomstring';
import { AuditLog } from '../models/auditLogs.model'; // Import your AuditLog entity
import { IAuditLog } from '../modelInterfaces';

type QueryParam = Partial<IAuditLog> | any;
type SelectOptions = Array<keyof IAuditLog>;
type RelationOptions = any[];
type Transaction = QueryRunner | undefined;

const Repository = {
  async getAuditLog(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<AuditLog | undefined> {
    const repository = t ? t.manager.getRepository(AuditLog) : getRepository(AuditLog);
    return repository.findOne({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async listAuditLogs(
    queryParam: QueryParam,
    selectOptions: SelectOptions,
    relationOptions?: RelationOptions,
    t?: Transaction,
  ): Promise<AuditLog[] | any[]> {
    const repository = t ? t.manager.getRepository(AuditLog) : getRepository(AuditLog);
    return repository.find({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },

  async createAuditLog(queryParams: Partial<AuditLog> | Partial<AuditLog>[] | any, t?: Transaction): Promise<AuditLog> {
    const repository = t ? t.manager.getRepository(AuditLog) : getRepository(AuditLog);
    const payload = {
      code: `aul_${randomstring.generate({ length: 17, capitalization: 'lowercase', charset: 'alphanumeric' })}`,
      ...queryParams,
    };
    return repository.save(payload);
  },

  async updateAuditLog(queryParams: Partial<AuditLog>, updateFields: QueryParam, t?: Transaction): Promise<UpdateResult> {
    const repository = t ? t.manager.getRepository(AuditLog) : getRepository(AuditLog);
    return repository.update(queryParams, updateFields);
  },
};

export default Repository;
