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
  ],
};
