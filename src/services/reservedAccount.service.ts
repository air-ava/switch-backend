import { getSchool } from '../database/repositories/schools.repo';
import { getStudent } from '../database/repositories/student.repo';
import { assignAccountNumberDTO } from '../dto/reservedAccount.dto';
import { NotFoundError, sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';

const Service = {
  async assignAccountNumber(data: assignAccountNumberDTO): Promise<theResponse> {
    const { holder, holderId } = data;
    let accountNumberHolder;
    // eslint-disable-next-line default-case
    switch (holder) {
      case 'student': {
        accountNumberHolder = await getStudent({ id: holderId }, []);
        if (!accountNumberHolder) throw new NotFoundError(`Student`);
        break;
      }
      case 'school': {
        accountNumberHolder = await getSchool({ id: holderId }, []);
        if (!accountNumberHolder) throw new NotFoundError(`School`);
        break;
      }
    }
    return sendObjectResponse(`Successfully processed request`);
  },
};
export default Service;
