/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { theResponse } from '../utils/interface';
import ValidationError from '../utils/validationError';
import ModelRepo from '../database/repositories/index.repo';
import AuditLogsRepo from '../database/repositories/auditLogs.repo';

const Service = {
  async createLog({
    event,
    user_type,
    user,
    table_type: tableName,
    table_id: rowId,
    code,
    initial_state: initialState,
    delta,
  }: any): Promise<theResponse | any> {
    if (!(event && user && tableName && (rowId || code))) {
      throw new ValidationError('event, user, table_type, table_id are required');
    }
    const foundTable = code && (await ModelRepo.findTableById(tableName, code));

    return AuditLogsRepo.createAuditLog({
      event,
      user_type,
      user_id: user,
      initial_state: initialState && initialState,
      delta,
      table_type: tableName,
      table_id: rowId || foundTable.id,
    });
  },

  updateLog(code: string, payload: any) {
    return AuditLogsRepo.updateAuditLog(payload, { where: { code } });
  },

  listAuditLogs(data: any) {
    const { user_type = 'backOfficeUsers', userCode } = data;
    return AuditLogsRepo.listAuditLogs({ user_type }, []);
  },
};

export default Service;
