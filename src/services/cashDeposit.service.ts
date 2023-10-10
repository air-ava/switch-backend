import randomstring from 'randomstring';
import { In, Not } from 'typeorm';
import { v4 } from 'uuid';
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
import { getOneTransactionREPO, saveTransaction } from '../database/repositories/transaction.repo';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import Settings from './settings.service';
import { creditLedgerWallet } from './lien.service';

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
    const { name: payerName, phoneNumber: payerPhone, email: payerEmail } = payerDetails;

    const cashPayload: any = {};
    // confirm stundent
    const student = await getStudent({ uniqueStudentId: studentId, status: Not(STATUSES.DELETED) }, [], ['Classes', 'Classes.ClassLevel']);
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
    const studentPaymentFee = await getBeneficiaryProductPayment({ code: StudentFeeCode, status: Not(STATUSES.DELETED) }, [], ['Fee']);
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
      ip_address: ipAddress,
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

    // Send Slack Message of Recorded Cash Deposits
    return sendObjectResponse('Cash Deposited successfully');
  },

  // submitRecieptForCashDeposits
  // [ addListOfLogs, recipts, recordTransactions(processing), status(Unresolved), approvalStatus(Pending) ]
  async submitRecieptForCashDeposits(data: any): Promise<theResponse> {
    const { ipAddress, cashDeposits, recipts, clientCordinate, deviceDetails, loggedInUser, school, currency = 'UGX' } = data;
    const { longitude, latitude } = clientCordinate;

    // confirm all submitted cashDeposit Codes
    const foundCashDeposit = await CashDepositRepo.listCashDeposits({ code: In(cashDeposits) }, []);
    if (foundCashDeposit.length !== cashDeposits.length) throw new NotFoundError(`${cashDeposits.length - foundCashDeposit.length} Cash Deposits`);

    // Get Wallet
    const wallet = await WalletREPO.findWallet({ entity: 'school', entity_id: school.id, type: 'permanent' }, [], ['User']);
    if (!wallet) throw new NotFoundError(`Wallet`);
    const user = wallet.User;

    // Get Sum of CashDeposit
    const totalDeposits = await CashDepositRepo.getSummedAmountsByCurrency(cashDeposits, currency);

    // Initiate Transaction
    const reference = v4();
    const txPurpose = Settings.get('TRANSACTION_PURPOSE');
    const txAmount = totalDeposits[0].total_amount;
    const txCharges = 0;
    const description = 'Reconcilliation of Cash Deposits';
    const metadata: any = {
      amountWithFees: txAmount + txCharges,
      amount: txAmount,
      charges: txAmount,
      tx_reference: reference,
      transaction_type: txPurpose['school-fees'].purpose,
      deposits: cashDeposits
    };

    await saveTransaction({
      walletId: wallet.id,
      userId: wallet.userId,
      amount: txAmount,
      balance_after: Number(wallet.balance) + Number(txAmount),
      balance_before: Number(wallet.balance),
      purpose: txPurpose['school-fees'].purpose,
      metadata,
      reference,
      status: STATUSES.PROCESSING,
      description,
      txn_type: txPurpose['school-fees'].type,
      channel: 'cash-deposit',
    });

    await creditLedgerWallet({
      // amount: Number(amount),
      amount: Number(txAmount),
      user,
      walletId: wallet.id,
      reference,
      description,
      metadata,
      saveToTransaction: false,
    });

    // Record Transaction Reciepts
    let transaction_reference: string;
    if (recipts) {
      const process = 'transactions';
      transaction_reference = `trx_${randomstring.generate({ length: 12, capitalization: 'lowercase', charset: 'alphanumeric' })}`;
      const transaction = await getOneTransactionREPO({ reference, txn_type: txPurpose['school-fees'].type, channel: 'cash-deposit' }, []);
      await Promise.all(
        recipts.map((document: string) =>
          createAsset({
            imagePath: document,
            user: loggedInUser.id,
            trigger: `${process}:submit_deposit_reciepts`,
            reference: transaction_reference,
            organisation: loggedInUser.organisation,
            entity: process,
            entity_id: String(transaction.id),
            customName: `ref:${reference}|process:${process}-add_reciepts`,
          }),
        ),
      );
    }
    // Update all submitted cashDeposit's aproval_status, status, and transaction_reference

    await Promise.all(
      // eslint-disable-next-line array-callback-return
      foundCashDeposit.map((deposit: any) => {
        const updatePayload = {
          status: STATUSES.UNRESOLVED,
          approval_status: STATUSES.PENDING,
          transaction_reference,
        };
        CashDepositRepo.updateCashDeposit({ id: deposit.id }, updatePayload);
        CashDepositLogRepo.createCashDepositLog({
          cash_deposits_id: deposit.id,
          initiator_id: loggedInUser.id,
          device_id: deviceDetails.id,
          action: 'SUBMITTED',
          state_before: JSON.stringify(deposit),
          state_after: JSON.stringify({ ...deposit, ...updatePayload }),
          longitude,
          latitude,
          ip_address: ipAddress,
        });
      }),
    );

    // Send Slack Message of Transaction Requiring Review

    return sendObjectResponse('Deposit Reciept Submitted successfully');
  },

  // reviewCashDeposits
  // [ recordBeneficiaryPaymentHistory, creditWallet, debitFees, recordTransactions(succeess || failed), status(Resolved || Cancelled), approvalStatus(Approved || Rejected) ]

  // updateCashDepositRecord
  // listCashDeposit
  // getCashDeposit
  // getCashDepositLog
};

export default Service;
