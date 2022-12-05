import { getConnection, QueryRunner } from 'typeorm';

export const getQueryRunner = async (): Promise<QueryRunner> => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  return queryRunner;
};

export const dbTransaction = async (callback: any): Promise<any> => {
  const queryRunner = await getQueryRunner();
  try {
    const result = await callback(queryRunner);
    await queryRunner.commitTransaction();
    return result;
  } catch (e) {
    await queryRunner.rollbackTransaction();
    throw e;
  } finally {
    await queryRunner.release();
  }
};
