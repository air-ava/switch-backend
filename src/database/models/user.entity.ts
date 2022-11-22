// import { Sequelize, sequelize } from './index';

// const entity = (connection: any, DataTypes: any): any => {
//   const schema = {
//     first_name: {
//       type: DataTypes.STRING,
//       required: true,
//     },
//     last_name: DataTypes.STRING,
//     other_name: {
//       type: DataTypes.STRING,
//     },
//     user_type: {
//       type: DataTypes.ENUM,
//       values: ['sponsor', 'partner', 'scholar', 'steward'],
//       allowNull: false,
//     },
//     email: DataTypes.STRING,
//     image: DataTypes.STRING,
//     title: DataTypes.STRING,
//     code: DataTypes.STRING,
//     phone: DataTypes.STRING,
//     employer: DataTypes.STRING,
//     job_title: DataTypes.STRING,
//     industry_skills: DataTypes.STRING,
//     job_status: DataTypes.STRING,
//     country: DataTypes.STRING,
//     state: DataTypes.STRING,
//     area: DataTypes.STRING,
//     city: DataTypes.STRING,
//     bio: DataTypes.TEXT,
//     email_verified_at: DataTypes.DATE,
//     business_name: DataTypes.STRING,
//     provider: DataTypes.STRING,
//     provider_id: DataTypes.STRING,
//     facebook: DataTypes.STRING,
//     linkedin: DataTypes.STRING,
//     twitter: DataTypes.STRING,
//     website: DataTypes.STRING,
//     remember_token: DataTypes.STRING,
//     slug: DataTypes.STRING,
//     address: DataTypes.STRING,
//     instagram: DataTypes.STRING,
//     logo: DataTypes.STRING,
//     organisation_email: DataTypes.STRING,
//     organisation_headline: DataTypes.STRING,
//     organisation_bio: DataTypes.TEXT,
//     organisation_code: DataTypes.TEXT,
//     organisation_phone: DataTypes.TEXT,
//     organisation_address: DataTypes.TEXT,
//     organisation_country: DataTypes.TEXT,
//     organisation_state: DataTypes.TEXT,
//     organisation_area: DataTypes.TEXT,
//     organisation_city: DataTypes.TEXT,
//     password: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     created_at: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.literal('CURRENT_TIMESTAMP'),
//     },
//     updated_at: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.literal('CURRENT_TIMESTAMP'),
//       onUpdate: DataTypes.literal('CURRENT_TIMESTAMP'),
//     },
//   };
//   return connection.define('user', schema, { timestamps: false });
// };

// const User = entity(sequelize, Sequelize);
// export default User;
