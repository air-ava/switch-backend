import { QueryRunner, getRepository } from 'typeorm';
import Models from '../models';

const Repo = {
  async findTableById(tableName: string, code: string, t?: QueryRunner): Promise<any> {
    const repository = t ? t.manager.getRepository(Models[tableName]) : getRepository(Models[tableName]);
    return repository.findOne({ where: { code }, select: ['id'] });
  },
};

export default Repo;
