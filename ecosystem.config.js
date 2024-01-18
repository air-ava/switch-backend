module.exports = {
  apps: [
    {
      name: 'base-service',
      script: 'npm',
      args: 'run start',
    },
    {
      script: 'build/consumer/reviewCustomer.consumer.js',
      name: 'review-customer-consumer',
    },
    {
      script: 'build/consumer/email.consumer.js',
      name: 'email-notification-consumer',
    },
    {
      script: 'build/consumer/slack.consumer.js',
      name: 'slack-notification-consumer',
    },
    {
      script: 'build/consumer/sms.consumer.js',
      name: 'sms-notification-consumer',
    },
    {
      script: 'build/consumer/appNotification.consumer.js',
      name: 'app-notification-consumer',
    },
    {
      script: 'build/consumer/thirdpartyActivity.consumer.js',
      name: 'thirdparty-activity-logger-consumer',
    },
    {
      script: 'build/consumer/debitTransactionCharge.consumer.js',
      name: 'debit-transaction-charge-consumer',
    },
    {
      script: 'build/consumer/recordReservedAccountDeposit.consumer.js',
      name: 'record-reserved-account-deposit-consumer',
    },
    {
      script: 'build/consumer/recordStudentInstallmentalPayment.consumer.js',
      name: 'record-student-installmental-payment-consumer',
    },
    {
      script: 'build/consumer/bankTransferVerification.consumer.js',
      name: 'bank-transfer-verification-consumer',
    },
    {
      script: 'build/consumer/assignAccountNumber.consumer.js',
      name: 'assign-account-number-consumer',
    },
    {
      script: 'build/consumer/createStudentFees.consumer.js',
      name: 'create-student-fees-consumer',
    },
    {
      script: 'build/consumer/addStudentGuardian.consumer.js',
      name: 'create-student-guardian-consumer',
    },
  ],
};
