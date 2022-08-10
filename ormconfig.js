// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require('path');

module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST || `127.0.0.1`,
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: '',
  database: process.env.DB_NAME || 'shopping_cart',
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
