export default {
  HOST: 'steward-do-user-12149228-0.b.db.ondigitalocean.com' || 'localhost',
  USER: 'doadmin' || 'root',
  PORT: 25060 || 3306,
  PASSWORD: 'AVNS_WvDzYODCV2A1tKm2M-D',
  DB: 'defaultdb' || 'testdb',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: true || process.env.DB_QUERY_LEVEL,
};
