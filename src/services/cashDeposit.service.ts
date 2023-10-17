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
import { findOrCreatePaymentContacts, getPaymentContact, updatePaymentContacts } from '../database/repositories/paymentContact.repo';
import { getClassLevel } from '../database/repositories/classLevel.repo';
import CashDepositRepo from '../database/repositories/cashDeposit.repo';
import CashDepositLogRepo from '../database/repositories/cashDepositLog.repo';
import { createAsset } from './assets.service';
import { IStudentClass } from '../database/modelInterfaces';
import { getOneTransactionREPO, saveTransaction, updateTransactionREPO } from '../database/repositories/transaction.repo';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import Settings from './settings.service';
import { creditLedgerWallet, debitLedgerWallet } from './lien.service';
import { getTransactionReference } from './transaction.service';
import { Service as WalletService } from './wallet.service';
import FeesService from './fees.service';
import { updateStatusOfALienTransaction } from '../database/repositories/lienTransaction.repo';

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
    const { name: payerName, phoneNumber: payerPhone, email: payerEmail, relationship, gender } = payerDetails;

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
    if (studentPaymentFee.amount_outstanding <= 0) throw new ValidationError('Fee has been fully paid');

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
      relationship: relationship && relationship,
      gender: gender && gender,
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
    const { ipAddress, cashDeposits, bankName, recipts, clientCordinate, deviceDetails, loggedInUser, school, currency = 'UGX' } = data;
    const { longitude, latitude } = clientCordinate;

    // confirm all submitted cashDeposit Codes
    const foundCashDeposit = await CashDepositRepo.listCashDeposits({ code: In(cashDeposits) }, []);
    if (foundCashDeposit.length !== cashDeposits.length) throw new NotFoundError(`${cashDeposits.length - foundCashDeposit.length} Cash Deposits`);
    // check if all cashDeposits are in LOGGED status
    const allCashDepositsAreLogged = foundCashDeposit.every((cashDeposit: any) => cashDeposit.status === STATUSES.UNRESOLVED);
    if (!allCashDepositsAreLogged) throw new ValidationError('Some Cash Deposits have already been submitted');

    // Get Wallet
    const wallet = await WalletREPO.findWallet({ entity: 'school', entity_id: school.id, type: 'permanent' }, [], undefined, ['User']);
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
      deposits: cashDeposits,
      bankName,
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
      type: 'cash-deposit-logging',
      reference,
      description,
      metadata,
      saveToTransaction: false,
    });

    // Record Transaction Reciepts
    let transaction_reference: string;
    if (recipts) {
      const process = 'transactions';
      const transaction = await getOneTransactionREPO({ reference, txn_type: txPurpose['school-fees'].type, channel: 'cash-deposit' }, []);
      transaction_reference = await getTransactionReference(transaction);
      await Promise.all(
        recipts.map((document: string) =>
          createAsset({
            imagePath: document,
            user: loggedInUser.id,
            trigger: `${process}:submit_deposit_reciepts`,
            reference: transaction_reference || reference,
            organisation: loggedInUser.organisation,
            entity: process,
            entity_id: String(transaction.id),
            customName: `ref:${reference}|process:${process}-add_reciepts`,
          }),
        ),
      );
      await updateTransactionREPO({ id: transaction.id }, { document_reference: transaction_reference });
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
  async reviewCashDeposits(data: {
    status: 'approved' | 'rejected';
    transactionReference: string;
    ipAddress: string;
    clientCordinate: {
      longitude: number;
      latitude: number;
    };
    deviceDetails: any;
    loggedInUser: {
      id: string;
      organisation: string;
    };
  }): Promise<theResponse> {
    const { status: incomingStatus = 'approved', transactionReference } = data;
    const { ipAddress, clientCordinate, deviceDetails, loggedInUser } = data;
    const { longitude, latitude } = clientCordinate;
    // get cash deposits using transaction_reference
    const cashDeposits = await CashDepositRepo.listCashDeposits(
      { transaction_reference: transactionReference, status: STATUSES.UNRESOLVED },
      [],
      ['StudentFee', 'Payer'],
    );
    if (!cashDeposits.length) throw new NotFoundError('Cash Deposits');

    const status = STATUSES[incomingStatus.toUpperCase() as keyof typeof STATUSES];
    // if incomingStatus is rejected, confirm all cashDeposits status as Cancelled and approval_status as Rejected
    await Promise.all(
      // eslint-disable-next-line array-callback-return
      cashDeposits.map((deposit: any) => {
        const updatePayload = {
          status: status === STATUSES.REJECTED ? STATUSES.CANCELLED : STATUSES.RESOLVED,
          approval_status: status === STATUSES.REJECTED ? STATUSES.REJECTED : STATUSES.APPROVED,
        };
        CashDepositRepo.updateCashDeposit({ id: deposit.id }, updatePayload);
        CashDepositLogRepo.createCashDepositLog({
          cash_deposits_id: deposit.id,
          initiator_id: loggedInUser.id,
          device_id: deviceDetails.id,
          action: 'COMPLETED',
          state_before: JSON.stringify(deposit),
          state_after: JSON.stringify({ ...deposit, ...updatePayload }),
          longitude,
          latitude,
          ip_address: ipAddress,
        });
      }),
    );
    // if incomingStatus is rejected, fail the transaction of transaction_reference
    const transaction = await getOneTransactionREPO({ reference: transactionReference }, [], ['Wallet', 'Wallet.User']);
    if (!transaction) throw new NotFoundError('Transaction');
    const { Wallet: wallet, amount, metadata, purpose, reference, description } = transaction;

    if (status === STATUSES.REJECTED) {
      await debitLedgerWallet({
        amount,
        user: wallet.User,
        walletId: wallet.id,
        reference,
        metadata,
        type: 'cash-deposit-logging',
      });
      await updateTransactionREPO({ id: transaction.id }, { status: STATUSES.FAILED });
      return sendObjectResponse(`Submitted Cash Deposits rejected`);
    }
    // if incomingStatus is approved, credit wallet the sum of all cashDeposits after debiting the ledger wallet
    await debitLedgerWallet({
      amount,
      user: wallet.User,
      walletId: wallet.id,
      reference,
      metadata,
      type: 'cash-deposit-logging',
    });
    await WalletService.creditWallet({
      amount,
      user: wallet.User,
      wallet_id: wallet.id,
      purpose,
      description: 'Completing Mobile Money Funding',
      metadata,
      reference,
      noTransaction: true,
      // t,
    });
    await updateTransactionREPO({ id: transaction.id }, { status: STATUSES.SUCCESS });

    const feesConfig = Settings.get('TRANSACTION_FEES');
    const {
      success: debitSuccess,
      data: transactionFees,
      error: debitError,
    } = await WalletService.debitTransactionFees({
      wallet_id: wallet.id,
      reference,
      user: wallet.User,
      description,
      feesNames: ['credit-fees'],
      transactionAmount: amount,
    });
    const feesPurposeNames: string[] = [feesConfig['credit-fees'].purpose];
    await updateTransactionREPO(
      { reference, purpose: Not(In(purpose)) },
      {
        metadata: {
          ...metadata,
          transactionFees,
          fees: feesPurposeNames,
        },
      },
    );

    await Promise.all(
      // eslint-disable-next-line array-callback-return
      cashDeposits.map((deposit: any) => {
        const { id: beneficiaryId } = deposit.StudentFee;
        FeesService.recordInstallment({
          amount,
          reference,
          paymentContact: deposit.Payer,
          metadata,
          beneficiaryId,
        });
      }),
    );
    return sendObjectResponse(`Submitted Cash Deposits approved`);
  },

  // updateCashDepositRecord
  async updateCashDepositRecord(data: any): Promise<theResponse> {
    const {
      code,
      amount,
      status,
      notes,
      description,
      studentId,
      studentFeeCode,
      payerDetails,
      periodCode,
      classCode,
      recieptUrls,
      relationship,
      gender,
    } = data;
    const { ipAddress, clientCordinate, deviceDetails, loggedInUser } = data;
    const { longitude, latitude } = clientCordinate;

    const updatePayload: any = {};
    if (status) {
      updatePayload.status = STATUSES[status.toUpperCase() as keyof typeof STATUSES];
      if (updatePayload.status === STATUSES.DELETED) updatePayload.approval_status = STATUSES.INACTIVE;
    }
    if (amount) updatePayload.amount = amount;
    if (notes) updatePayload.notes = notes;
    if (description) updatePayload.description = description;
    if (relationship) updatePayload.relationship = relationship;
    if (gender) updatePayload.gender = gender;

    const action = status === STATUSES.DELETED ? 'DELETED' : 'UPDATED';

    const deposit = await CashDepositRepo.getCashDeposit({ code, status: STATUSES.DELETED }, []);
    if (!deposit) throw new NotFoundError('Cash Deposit');

    if (studentId) {
      const student = await getStudent({ uniqueStudentId: studentId, status: Not(STATUSES.DELETED) }, [], ['Classes', 'Classes.ClassLevel']);
      if (!student) throw new NotFoundError('Student');
      const { Classes, ...rest } = student;

      // get current class from Student
      const [studentCurrentClass] = Classes.filter((value: IStudentClass) => value.status === STATUSES.ACTIVE);
      updatePayload.student_id = student.id;
      updatePayload.class_id = studentCurrentClass.ClassLevel.id;
    }

    if (studentFeeCode) {
      const studentPaymentFee = await getBeneficiaryProductPayment({ code: studentFeeCode, status: Not(STATUSES.DELETED) }, [], ['Fee']);
      if (!studentPaymentFee) throw new NotFoundError('Fee');
      if (!(studentPaymentFee.beneficiary_id === deposit.student_id && studentPaymentFee.beneficiary_type === 'student'))
        throw new ValidationError('Fee does not belong to Student');
      updatePayload.beneficiary_product_id = studentPaymentFee.id;
    }

    let message: any;
    if (payerDetails) {
      const { name: payerName, phoneNumber: payerPhone, email: payerEmail } = payerDetails;
      const updatePayerPayload = {
        phone_number: payerPhone && payerPhone,
        email: payerEmail && payerEmail,
        name: payerName && payerName,
      };
      const before = await getPaymentContact({ id: deposit.payer_id }, []);
      if (!before) throw new NotFoundError('Payer');

      message = { action: 'update payment contact', before, after: updatePayerPayload };
      await updatePaymentContacts({ id: deposit.payer_id }, updatePayerPayload);
    }

    if (periodCode) {
      const eduPeriod: any = await getEducationPeriod({ code: periodCode }, []);
      updatePayload.period = eduPeriod.id;
    }

    if (classCode) {
      const foundClassLevel = await getClassLevel({ code: classCode }, []);
      if (!foundClassLevel) throw new NotFoundError('Class For School');
      updatePayload.class_id = foundClassLevel.id;
    }

    if (recieptUrls) {
      const process = 'cashDeposits';
      updatePayload.reciept_reference = deposit.reciept_reference
        ? deposit.reciept_reference
        : `cashD_${randomstring.generate({ length: 12, capitalization: 'lowercase', charset: 'alphanumeric' })}`;
      await Promise.all(
        recieptUrls.map((document: string) =>
          createAsset({
            imagePath: document,
            user: loggedInUser.id,
            trigger: `${process}:add_reciepts`,
            reference: updatePayload.reference,
            organisation: loggedInUser.organisation,
            entity: process,
            entity_id: String(deposit.id),
            customName: `ref:${updatePayload.reference}|process:${process}-add_reciepts`,
          }),
        ),
      );

      message = { action: 'added reciepts/documents', added: recieptUrls };
    }

    // check if updatePayload is not an empty object
    if (Object.keys(updatePayload).length !== 0) await CashDepositRepo.updateCashDeposit({ code }, updatePayload);
    await CashDepositLogRepo.createCashDepositLog({
      cash_deposits_id: deposit.id,
      initiator_id: loggedInUser.id,
      device_id: deviceDetails.id,
      action,
      state_before: JSON.stringify(deposit),
      state_after: JSON.stringify({ ...deposit, ...updatePayload, message }),
      longitude,
      latitude,
      ip_address: ipAddress,
    });
    return sendObjectResponse(`Cash Deposit updated successfully`);
  },

  // listCashDeposit
  async listCashDeposit(data: any): Promise<theResponse> {
    const { code, studentId, StudentFeeCode, periodCode, classCode, status, approvalStatus, amount, currency, from, to } = data;
    const { perPage, page } = data;
    const { school } = data;

    const where: any = {};
    if (code) where.code = code;
    if (studentId) {
      const student = await getStudent({ uniqueStudentId: studentId, status: Not(STATUSES.DELETED) }, [], ['Classes', 'Classes.ClassLevel']);
      if (!student) throw new NotFoundError('Student');
      where.student_id = student.id;
    }
    if (StudentFeeCode) {
      const studentPaymentFee = await getBeneficiaryProductPayment({ code: StudentFeeCode, status: Not(STATUSES.DELETED) }, [], ['Fee']);
      if (!studentPaymentFee) throw new NotFoundError('Fee');
      where.beneficiary_product_id = studentPaymentFee.id;
    }
    if (periodCode) {
      const eduPeriod: any = await getEducationPeriod({ code: periodCode }, []);
      where.period = eduPeriod.id;
    }
    if (classCode) {
      const foundClassLevel = await getClassLevel({ code: classCode }, []);
      if (!foundClassLevel) throw new NotFoundError('Class For School');
      where.class_id = foundClassLevel.id;
    }
    if (status) where.status = STATUSES[status.toUpperCase() as keyof typeof STATUSES];
    if (approvalStatus) where.approval_status = STATUSES[approvalStatus.toUpperCase() as keyof typeof STATUSES];
    if (amount) where.amount = amount;
    if (currency) where.currency = currency;
    if (from) where.from = from;
    if (to) where.to = to;
    if (perPage) where.perPage = perPage;
    if (page) where.page = page;
    where.school_id = school.id;

    const cashDeposits = await CashDepositRepo.getAllCashDeposits(
      where,
      [],
      ['StudentFee', 'Payer', 'Student', 'User', 'ClassLevel', 'CashDepositLogs', 'CashDepositLogs.User', 'CashDepositLogs.Device'],
    );

    return sendObjectResponse('Cash Deposits retrieved successfully', cashDeposits);
  },
  // getCashDeposit
  async getCashDeposit(data: any): Promise<theResponse> {
    const { school, code } = data;

    const where: any = { code };
    where.school_id = school.id;

    const cashDeposit = await CashDepositRepo.getCashDeposit(where, [], ['StudentFee', 'Payer', 'Student', 'User', 'ClassLevel', 'CashDepositLogs']);

    return sendObjectResponse('Cash Deposit retrieved successfully', cashDeposit);
  },
  // getCashDepositLog
};

export default Service;
