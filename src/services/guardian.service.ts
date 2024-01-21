import { Not } from 'typeorm';
import { STATUSES } from '../database/models/status.model';
import { findIndividual } from '../database/repositories/individual.repo';
import { listStudentGuardian } from '../database/repositories/studentGuardian.repo';
import logger from '../utils/logger';
import { theResponse } from '../utils/interface';
import { getSchool } from '../database/repositories/schools.repo';
import NotFoundError from '../utils/notFounfError';
import { sendObjectResponse } from '../utils/errors';
import { mapAnArray } from '../utils/utils';
import { Sanitizer } from '../utils/sanitizer';

const Service = {
  async validateGuardianUsername(data: { guardian_username: string; school_slug: string }): Promise<theResponse> {
    const { guardian_username, school_slug } = data;

    const school = await getSchool({ slug: school_slug }, []);
    if (!school) throw new NotFoundError('School');

    const guardianDetail = await findIndividual(
      { username: guardian_username, type: 'guardian', status: Not(STATUSES.DELETED) },
      [],
      ['phoneNumber'],
    );
    if (!guardianDetail) throw new NotFoundError('Guardian');

    const studentGuardians = await listStudentGuardian(
      { individualId: guardianDetail.id },
      [],
      ['Student', 'Student.User', 'Student.ReservedAccounts', 'Student.User.Avatar'],
    );

    const guardiansWards = mapAnArray(studentGuardians, 'Student');
    return sendObjectResponse('Guardians wards retrieved successfully', {
      guardianDetail: Sanitizer.sanitizeIndividual(guardianDetail),
      guardiansWards: Sanitizer.sanitizeAllArray(guardiansWards, Sanitizer.sanitizeStudent),
    });
  },
};
export default Service;
