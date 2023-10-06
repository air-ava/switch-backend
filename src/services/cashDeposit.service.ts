import randomstring from 'randomstring';
import { theResponse } from '../utils/interface';
import { NotFoundError, ValidationError, sendObjectResponse } from '../utils/errors';
import { STATUSES } from '../database/models/status.model';
import { getStudent } from '../database/repositories/student.repo';
import { getBeneficiaryProductPayment } from '../database/repositories/beneficiaryProductPayment.repo';
import { getSchoolClass } from '../database/repositories/schoolClass.repo';
import { getEducationPeriod } from '../database/repositories/education_period.repo';
import { findOrCreatePaymentContacts } from '../database/repositories/paymentContact.repo';
import { getClassLevel } from '../database/repositories/classLevel.repo';
import CashDepositRepo from '../database/repositories/cashDeposit.repo';
import CashDepositLogRepo from '../database/repositories/cashDepositLog.repo';
import { createAsset } from './assets.service';
import { IStudentClass } from '../database/modelInterfaces';

const Service = {
  async createCashDeposit(data: any): Promise<theResponse> {
    // get deviceDetails and ipAddress from middleware
    const {
      school,
      session,
      periodCode,
      classCode,
      StudentFeeCode,
      studentId,
      loggedInUser,
      payerDetails,
      ipAddress,
      deviceDetails,
      clientCordinate,
      currency = 'UGX',
      amount,
      recieptUrls,
      description,
      notes,
    } = data;
    const { longitude, latitude } = clientCordinate;
    const { deviceName, deviceModel, deviceType, isMobile } = deviceDetails;
    const { name: payerName, phoneNumber: payerPhone, email: payerEmail } = payerDetails;

    const cashPayload: any = {};
    const cashLogPayload: any = {};
    // confirm stundent
    const student = await getStudent({ uniqueStudentId: studentId, status: STATUSES.DELETED }, [], ['Classes', 'Classes.ClassLevel']);
    if (!student) throw new NotFoundError('Student');
    const { Classes, ...rest } = student;

    // get current class from Student
    const [studentCurrentClass] = Classes.filter((value: IStudentClass) => value.status === STATUSES.ACTIVE);
    cashPayload.class_id = studentCurrentClass.ClassLevel.id;

    if (classCode) {
      const foundClassLevel = await getClassLevel({ code: classCode }, []);
      if (!foundClassLevel) throw new NotFoundError('Class For School');
      cashPayload.class_id = foundClassLevel.id;
    }

    // confirm stundentFee
    const studentPaymentFee = await getBeneficiaryProductPayment({ code: StudentFeeCode, status: STATUSES.DELETED }, [], ['Fee']);
    if (!studentPaymentFee) throw new NotFoundError('Fee');
    if (!(studentPaymentFee.beneficiary_id === student.id && studentPaymentFee.beneficiary_type === 'student'))
      throw new ValidationError('Fee does not belong to Student');

    // confirm session period
    if (periodCode) {
      const eduPeriod: any = await getEducationPeriod({ code: periodCode }, []);
      cashPayload.period = eduPeriod.id;
    }

    if (recieptUrls) cashPayload.reference = `cashD_${randomstring.generate({ length: 12, capitalization: 'lowercase', charset: 'alphanumeric' })}`;
    // confirm confirm/record Payer
    const paymentContact = await findOrCreatePaymentContacts({
      school: school.id,
      phone_number: payerPhone,
      email: payerEmail && payerEmail,
      status: STATUSES.ACTIVE,
      name: payerName && payerName,
    });

    // record cashDeposits
    const cashDeposit = await CashDepositRepo.createCashDeposit({
      student_id: student.id,
      recorded_by: loggedInUser.id,
      payer_id: paymentContact.id,
      school_id: school.id,
      currency,
      amount,
      class_id: cashPayload.class_id,
      period_id: cashPayload.period,
      session_id: session.id,
      beneficiary_product_id: studentPaymentFee.id,
      status: STATUSES.LOGGED,
      approval_status: STATUSES.INITIATED,
      notes: notes && notes,
      description: description && description,
      reciept_reference: cashPayload.reference,
    });

    // record cashDepositsLogs[this would carry, deviceId, lat-long, ip]
    await CashDepositLogRepo.createCashDepositLog({
      cash_deposits_id: cashDeposit.id,
      initiator_id: loggedInUser.id,
      device_id: deviceDetails.id,
      action: 'CREATED',
      state_after: JSON.stringify(cashDeposit),
      longitude,
      latitude,
      ipAddress,
    });

    // record Reciept
    if (recieptUrls) {
      const process = 'cashDeposits';
      await Promise.all(
        recieptUrls.map((document: string) =>
          createAsset({
            imagePath: document,
            user: loggedInUser.id,
            trigger: `${process}:add_reciepts`,
            reference: cashPayload.reference,
            organisation: loggedInUser.organisation,
            entity: process,
            entity_id: String(cashDeposit.id),
            customName: `ref:${cashPayload.reference}|process:${process}-add_reciepts`,
          }),
        ),
      );
    }
    return sendObjectResponse('Cash Deposited successfully');
  },
};

export default Service;
