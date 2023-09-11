import { QueryRunner, getRepository } from 'typeorm';
import Models from '../models';

const Repo = {
  async findTableById(tableName: string, code: string, t?: QueryRunner): Promise<any> {
    const repository = t ? t.manager.getRepository(Models[tableName]) : getRepository(Models[tableName]);
    return repository.findOne({ where: { code }, select: ['id'] });
  },

  async listTableRows(
    tableName: string,
    queryParam: any,
    selectOptions: any[],
    relationOptions?: any[],
    t?: QueryRunner | undefined,
  ): Promise<any[]> {
    const repository = t ? t.manager.getRepository(Models[tableName]) : getRepository(Models[tableName]);
    return repository.find({
      where: queryParam,
      ...(selectOptions.length && { select: selectOptions.concat(['id']) }),
      ...(relationOptions && { relations: relationOptions }),
    });
  },
};

export default Repo;
