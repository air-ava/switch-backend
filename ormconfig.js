// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require('path');

module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST || `127.0.0.1`,
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  logging: false,
  entities: [join(__dirname, 'build/database/models/**/*.js')],
  migrations: [join(__dirname, 'build/database/migrations/**/*.js')],
  subscribers: [join(__dirname, 'build/database/subscriber/**/*.js')],
  seeds: ['build/database/seeder/**/*.js'],
  cli: {
    entitiesDir: 'src/database/models',
    migrationsDir: 'src/database/migrations',
    subscribersDir: 'src/database/subscriber',
    seedsDir: 'src/database/seeder',
  },
  extra: {
    max: 25,
    connectionTimeoutMillis: 1000,
    // ssl: true,
    ssl: { rejectUnauthorized: false },
    // sslcert: '/etc/ssl/certs/ca-certificates.crt',
    // ssl: {},
  },
};
