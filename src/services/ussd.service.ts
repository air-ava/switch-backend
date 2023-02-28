import { IStudentClass } from '../database/modelInterfaces';
import { STATUSES } from '../database/models/status.model';
import { getStudent } from '../database/repositories/student.repo';
import { sendObjectResponse, BadRequestException } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { buildCollectionRequestPayload } from './payment.service';
import Settings from './settings.service';
import { Service as BayonicService } from './mobileMoney.service';

const Service = {
  async getStudent(criteria: any): Promise<theResponse> {
    const { studentId } = criteria;
    const student = await getStudent({ uniqueStudentId: studentId }, [], ['User', 'School', 'Classes', 'Classes.ClassLevel']);
    if (!student) return BadRequestException('END Student not found');
    const { User, School, Classes } = student;
    const [studentCurrentClass] = Classes && Classes.filter((value: IStudentClass) => value.status === STATUSES.ACTIVE);

    const { class: ClassName, class_short_name } = studentCurrentClass.ClassLevel;
    const baseResponse = `CON School: ${School.name},
    Student: ${User.first_name} ${User.last_name},
    Class: ${ClassName} (${class_short_name}),
    Fee: UGX${Settings.get('TRANSACTION_FEES')['mobile-money-fee'].flat}.
    Enter Amount
    `;
    return sendObjectResponse(baseResponse, student);
  },

  async sessionHandler(criteria: any): Promise<theResponse> {
    console.log({ criteria });
    const { phoneNumber, serviceCode, text, sessionId, networkCode } = criteria;
    const paths = text?.split('*');

    const baseResponse = `CON Welcome to Steward School Fees Payment
    Enter Student Code`;
    if (serviceCode !== Settings.get('USSD').serviceCode) return BadRequestException('END Invalid ussd code');
    if (!paths || !paths.length) return sendObjectResponse(baseResponse);
    const [studentId, incomingAmount] = paths;
    if (!studentId) return sendObjectResponse(baseResponse);
    if (studentId.length !== 9) return BadRequestException('END Invalid student code');
    if (studentId.length === 9) {
      if (incomingAmount) {
        const query = await buildCollectionRequestPayload({ studentId, phoneNumber, amount: incomingAmount });
        const response = await BayonicService.initiateCollectionRequest(query);
        return response.success
          ? sendObjectResponse('END School Fees Payment Completed')
          : BadRequestException('END Error With Completing School Fees Payment');
      }
      return Service.getStudent({ studentId });
    }

    return BadRequestException('END Invalid ussd code');
  },
};

export default Service;
