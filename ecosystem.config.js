module.exports = {
  apps: [
    {
      name: 'base-service',
      script: 'npm',
      args: 'run start:dev',
      exec_mode: 'cluster',
      watch: true,
    },
  ],
};
