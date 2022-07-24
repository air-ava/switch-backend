// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require('path');

module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST || 'chunee.db.elephantsql.com',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME || 'hfbzojbo',
  password: process.env.DB_PASSWORD || 'xrPFgXvRnCjR9OX1Sy_-dsp3qjyV05U1',
  database: process.env.DB_NAME || 'hfbzojbo',
  logging: false,
  entities: [join(__dirname, 'build/database/models/**/*.js')],
  migrations: [join(__dirname, 'build/database/migrations/**/*.js')],
  subscribers: [join(__dirname, 'build/database/subscriber/**/*.js')],
  cli: {
    entitiesDir: 'src/database/models',
    migrationsDir: 'src/database/migrations',
    subscribersDir: 'src/database/subscriber',
  },
  extra: {
    max: 25,
    connectionTimeoutMillis: 1000,
    // ssl: { rejectUnauthorized: false },
  },
};
