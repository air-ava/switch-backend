import { IStudentClass } from '../database/modelInterfaces';
import { STATUSES } from '../database/models/status.model';
import { getStudent } from '../database/repositories/student.repo';
import { sendObjectResponse, BadRequestException } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { buildCollectionRequestPayload } from './payment.service';
import Settings from './settings.service';
import { Service as BayonicService } from './mobileMoney.service';
import { saveThirdPartyLogsREPO } from '../database/repositories/thirdParty.repo';
import { STEWARD_BASE_URL } from '../utils/secrets';

const Service = {
  async getStudent(criteria: any): Promise<theResponse> {
    const { studentId, phoneNumber, incomingData, reference } = criteria;
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

    saveThirdPartyLogsREPO({
      event: 'ussd-school-fees-payment',
      message: `USSD-Schoo-Fees:${phoneNumber}`,
      endpoint: `${STEWARD_BASE_URL}/ussd/africastalking`,
      school: School.id,
      endpoint_verb: 'POST',
      status_code: '200',
      payload: JSON.stringify(incomingData),
      provider_type: 'ussd-provider',
      provider: 'AFRICAS-TALKING',
      reference,
    });
    return sendObjectResponse(baseResponse, student);
  },

  async sessionHandler(criteria: any): Promise<theResponse> {
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
      return Service.getStudent({
        studentId,
        phoneNumber: phoneNumber.replace('+', ''),
        incomingData: criteria,
        reference: `${sessionId}:${networkCode}:${Service.getTelco(networkCode)} `,
      });
    }

    return BadRequestException('END Invalid ussd code');
  },

  getTelco(code: string): string {
    const telcoCodes: { [key: string]: string } = {
      '62001': 'MTN Ghana',
      '62002': 'Vodafone Ghana',
      '62006': 'AirtelTigo Ghana',
      '62120': 'Airtel Nigeria',
      '62130': 'MTN Nigeria',
      '62150': 'Glo Nigeria',
      '62160': 'Etisalat Nigeria',
      '63510': 'MTN Rwanda',
      '63513': 'Tigo Rwanda',
      '63514': 'Airtel Rwanda',
      '63601': 'EthioTelecom Ethiopia',
      '63902': 'Safaricom Kenya',
      '63903': 'Airtel Kenya',
      '63907': 'Orange Kenya',
      '63999': 'Equitel Kenya',
      '64002': 'Tigo Tanzania',
      '64004': 'Vodacom Tanzania',
      '64005': 'Airtel Tanzania',
      '64101': 'Airtel Uganda',
      '64110': 'MTN Uganda',
      '64114': 'Africell Uganda',
      '64501': 'Airtel Zambia',
      '64502': 'MTN Zambia',
      '65001': 'TNM Malawi',
      '65010': 'Airtel Malawi',
      '65501': 'Vodacom South Africa',
      '65502': 'Telkom South Africa',
      '65507': 'CellC South Africa',
      '65510': 'MTN South Africa',
      '99999': 'SandBox(Athena)',
    };

    return telcoCodes[code];
  },
};

export default Service;
