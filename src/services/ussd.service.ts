import { IStudentClass } from '../database/modelInterfaces';
import { STATUSES } from '../database/models/status.model';
import { getStudent } from '../database/repositories/student.repo';
import { sendObjectResponse, BadRequestException } from '../utils/errors';
import { theResponse } from '../utils/interface';

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
    Fee: UGX 20.
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
    if (!paths || !paths.length) return sendObjectResponse(baseResponse);
    if (!paths[0]) return sendObjectResponse(baseResponse);
    if (paths[0].length !== 9) return BadRequestException('END Invalid student code');
    if (paths[0].length === 9) return Service.getStudent({ studentId: paths[0] });

    return BadRequestException('END Invalid ussd code');
  },
};

export default Service;
