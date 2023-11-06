/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as bcrypt from 'bcrypt';
import { IStudentClass } from '../database/modelInterfaces';
import { STATUSES } from '../database/models/status.model';
import { getStudent } from '../database/repositories/student.repo';
import { sendObjectResponse, BadRequestException, NotFoundError } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { buildCollectionRequestPayload } from './payment.service';
import Settings from './settings.service';
import { Service as BayonicService } from './mobileMoney.service';
import { Service as WalletService } from './wallet.service';
import { saveThirdPartyLogsREPO } from '../database/repositories/thirdParty.repo';
import { STEWARD_BASE_URL } from '../utils/secrets';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import { getSchool } from '../database/repositories/schools.repo';
import { v4 } from 'uuid';
import { createMobileMoneyPaymentREPO } from '../database/repositories/mobileMoneyPayment.repo';
import { phoneValidator } from '../validators/phoneNumber.validator';

const Service = {
  async getStudent(criteria: any): Promise<theResponse> {
    const { studentId, phoneNumber, incomingData, reference } = criteria;
    const student = await getStudent(
      { uniqueStudentId: studentId },
      [],
      ['User', 'School', 'Classes', 'Classes.ClassLevel', 'Fees', 'Fees.Fee', 'Fees.Fee.ProductType', 'Fees.Fee.PaymentType'],
    );
    if (!student || student.status === STATUSES.DELETED) return BadRequestException('END Student not found');
    const { User, School, Classes, Fees } = student;
    const [studentCurrentClass] = Classes && Classes.filter((value: IStudentClass) => value.status === STATUSES.ACTIVE);
    const [studentTutitionFee] =
      Fees &&
      Fees.filter(
        (value: any) => value.beneficiary_type === 'student' && value.Fee.feature_name === 'tuition-fees' && value.Fee.status === STATUSES.ACTIVE,
      );
    // const  = studentTutitionFees;

    const { class: ClassName, class_short_name } = studentCurrentClass.ClassLevel;
    const { product_currency, amount_outstanding, amount_paid } = studentTutitionFee || {};

    if (amount_outstanding < 1) return BadRequestException('END This student has no pending payments to make');
    const baseResponse = `CON ${School.name},
    ${User.first_name} ${User.last_name},
    ${ClassName} (${class_short_name}),
    ${
      Fees.length
        ? `Amount paid - ${product_currency}${amount_paid / 100}
           Amount due - ${product_currency}${amount_outstanding / 100}`
        : ``
    }
    Enter the amount you want to pay
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
    const { serviceCode, text, sessionId, networkCode } = criteria;
    let { phoneNumber } = criteria;

    const paths = text?.split('*');

    const choices = ['1'];
    const [paySchoolFees] = choices;
    const baseResponse = `CON 1. School fees payment
    `;

    const choiceSchoolFees = `CON Enter Student Code`;
    const badChoice = `END We currently do not provide this service.`;

    if (serviceCode !== Settings.get('USSD').serviceCode) return BadRequestException('END Invalid ussd code');
    if (!paths || !paths.length) return sendObjectResponse(baseResponse);

    const [, choice, studentId, incomingAmount] = paths;

    const { allFees: fees } = await WalletService.getAllFees(incomingAmount, [
      'mobile-money-subscription-school-fees',
      'steward-charge-school-fees',
      'mobile-money-collection-fees',
    ]);

    const sumTotal = Number(incomingAmount) + Number(fees / 100);

    const amountBaseResponse = `END Amount: UGX${incomingAmount}
    Fee: UGX${fees / 100}
    Proceed to confirm payment`;

    if (!choice) return sendObjectResponse(baseResponse);
    if (choice !== '1') return sendObjectResponse(badChoice);
    if (!choices.includes(choice)) return sendObjectResponse(badChoice);
    if (!studentId && choice === paySchoolFees) return sendObjectResponse(choiceSchoolFees);
    if (studentId.length !== 9) return BadRequestException('END Invalid student code');
    if (studentId.length === 9) {
      if (incomingAmount) {
        if (networkCode === '99999') phoneNumber = '+80000000003';
        if (networkCode === '99999' && Number(incomingAmount) > 1000) return BadRequestException('END Incoming Amount is higher than 1000');
        if (networkCode !== '99999' && Number(incomingAmount) < 500) return BadRequestException('END Incoming Amount is lower than 500');

        const query = await buildCollectionRequestPayload({
          studentId,
          feature_name: 'tuition-fees',
          phoneNumber,
          amount: incomingAmount * 100,
          amountWithFees: sumTotal * 100,
        });
        if (query.error) return BadRequestException(`END ${query.error}`);
        const response = await BayonicService.initiateCollectionRequest(query);
        return response.success ? sendObjectResponse(`${amountBaseResponse}`) : BadRequestException('END Error With Completing School Fees Payment');
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

  async schoolSessionHandler(criteria: any): Promise<theResponse> {
    const { serviceCode, text, sessionId, networkCode } = criteria;
    let { phoneNumber } = criteria;

    const paths = text?.split('*');

    const choices = ['1', '2', '3'];
    const [checkWalletBalance, sendMoney, payLoan] = choices;
    const baseResponse = `CON 1. Check Wallet Balance
      2. Send Money (MoMo)
      3. Pay Loan
    `;

    const enterSchoolCode = `CON Enter School Code`;
    const badChoice = `END We currently do not provide this service.`;

    // if (serviceCode !== Settings.get('USSD').schoolServiceCode) return BadRequestException('END Invalid ussd code');
    if (serviceCode !== Settings.get('USSD').serviceCode) return BadRequestException('END Invalid ussd code');
    if (!paths || !paths.length) return sendObjectResponse(baseResponse);

    const [, choice, schoolId, incomingAmount] = paths;

    console.log({ schoolSessionHandler: criteria, choice, choices });

    if (!choice) return sendObjectResponse(baseResponse);
    if (!choices.includes(choice)) return sendObjectResponse(badChoice);
    if (choice === payLoan) return sendObjectResponse('END Coming Soon');

    if (!schoolId && choice) return sendObjectResponse(enterSchoolCode);
    if (schoolId.length !== 10) return BadRequestException('END Invalid school code');
    if (schoolId.length === 10) {
      if (networkCode === '99999') phoneNumber = '+80000000003';
    }
    if (choice === checkWalletBalance) return Service.checkWalletBalance({ schoolId, text });
    if (choice === sendMoney) return Service.sendMoney({ schoolId, text, phoneNumber, networkCode });
    return BadRequestException('END Invalid ussd code');
  },

  async checkWalletBalance(data: any): Promise<theResponse> {
    const { text, schoolId: walletId } = data;

    const paths = text?.split('*');
    const [, , , transactionPin] = paths;

    const wallet = await WalletREPO.findWallet({ uniquePaymentId: walletId, entity: 'school' }, [], undefined, ['User']);
    if (!wallet) return BadRequestException('END Wallet does not exist');

    if (transactionPin && !bcrypt.compareSync(transactionPin, wallet.transaction_pin)) {
      return BadRequestException('END Provided PIN is incorrect');
    }

    const school = await getSchool({ id: wallet.entity_id }, []);
    if (!school) return BadRequestException('END School does not exist');

    const baseResponse = `END ${school.name}
    Wallet balnce: ${wallet.currency}${wallet.balance}`;

    return sendObjectResponse(baseResponse, wallet);
  },

  async sendMoney(data: any): Promise<theResponse> {
    const { text, schoolId: walletId, networkCode, phoneNumber } = data;

    const paths = text?.split('*');
    const [, , , recieversPhone, confirmPayment, incomingAmount] = paths;

    if (!recieversPhone) return BadRequestException('END Recievers Phone Number is needed, [eg: 256XXXXXXXXX]');
    const { error } = phoneValidator.validate({ phone: recieversPhone });
    if (error) return BadRequestException(`END ${error.message}`);

    const feesNames = ['mobile-money-subscription-school-fees', 'steward-charge-school-fees', 'mobile-money-collection-fees'];
    if (incomingAmount) {
      const { allFees: fees } = await WalletService.getAllFees(incomingAmount, feesNames);

      const sumTotal = Number(incomingAmount) + Number(fees / 100);

      const amountBaseResponse = `END Amount: UGX${incomingAmount}
      Fee: UGX${fees / 100}
      Proceed to confirm payment`;

      if (networkCode === '99999' && Number(incomingAmount) > 1000) return BadRequestException('END Incoming Amount is higher than 1000');
      if (networkCode !== '99999' && Number(incomingAmount) < 500) return BadRequestException('END Incoming Amount is lower than 500');

      const query = await buildCollectionRequestPayload({
        walletId,
        feature_name: 'tuition-fees',
        phoneNumber,
        amount: incomingAmount * 100,
        amountWithFees: sumTotal * 100,
        transactionPurpose: 'cash-out',
      });
      if (query.error) return BadRequestException(`END ${query.error}`);

      const response = await BayonicService.initiatePayment({
        ...query,
        feesNames,
        amount: query.amount,
        purpose: 'cash-out',
        method: `USSD:Payment`,
        network: `${networkCode}:${Service.getTelco(networkCode)}`,
        network_name: Service.getTelco(networkCode),
      });
      // const response = await BayonicService.initiatePayment(query);
      return response.success ? sendObjectResponse(`${amountBaseResponse}`) : BadRequestException('END Error With Withdrawal');
      // return sendObjectResponse(`${amountBaseResponse}`);
    }

    if (confirmPayment) {
      const [yes, no] = ['1', '2'];
      let response;
      switch (confirmPayment) {
        case yes:
          response = sendObjectResponse(`CON Please enter amount`);
          break;
        case no:
          response = BadRequestException('END Start again with the Correct Phone Number');
          break;
        default:
          response = BadRequestException('END Invalid choice selected');
      }
      return response;
    }

    const baseResponse = `CON Confirm this Phone ${recieversPhone}
    1. Yes
    2. No
    `;

    return sendObjectResponse(baseResponse);
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

  async homePage(criteria: any): Promise<theResponse> {
    const { serviceCode, text } = criteria;
    const baseResponse = `CON Welcome to Steward
      1. School Fees Payment
      2. For Schools
    `;
    const paths = text?.split('*');
    console.log({
      paths,
      serviceCode,
      USSD: Settings.get('USSD')
    })
    if (serviceCode !== Settings.get('USSD').serviceCode) return BadRequestException('END Invalid ussd code');

    const choices = ['1', '2'];
    const [paySchoolFees, schoolActivity] = choices;
    const [firstLevelChoice] = paths;

    if (!firstLevelChoice) return sendObjectResponse(baseResponse);
    // const ussdServiceCodes = Settings.get('USSD');
    console.log({
      firstLevelChoice,
      schoolActivity,
    });
    let response;
    switch (firstLevelChoice) {
      case paySchoolFees:
        response = await Service.sessionHandler(criteria);
        break;
      case schoolActivity:
        response = await Service.schoolSessionHandler(criteria);
        break;
      default:
        response = BadRequestException('END Invalid ussd code');
    }

    return response;
  },
};

export default Service;
// *168714389*502
