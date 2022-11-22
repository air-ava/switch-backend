// import { Transaction } from 'sequelize';
// import { Sequelize } from '../models';
// import User from '../models/user.entity';
// import { UserInterface } from '../entityInterface';

// export const getOneUser = async ({
//   queryParams,
//   selectOptions = [],
//   transaction,
// }: {
//   queryParams?: Partial<UserInterface | any>;
//   selectOptions?: any;
//   transaction?: Transaction;
// }): Promise<UserInterface | undefined> => {
//   // eslint-disable-next-line no-param-reassign
//   return User.findOne(
//     {
//       where: queryParams,
//       ...(selectOptions.length && { attributes: selectOptions.concat(['id', 'code']) }),
//     },
//     transaction && { transaction },
//   );
// };
