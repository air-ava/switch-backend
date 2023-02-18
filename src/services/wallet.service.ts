/* eslint-disable array-callback-return */
import randomstring from 'randomstring';
import { v4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { findCurrency } from '../database/repositories/curencies.repo';
import { BadRequestException, sendObjectResponse } from '../utils/errors';
import { ControllerResponse } from '../utils/interface';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import { getQueryRunner } from '../database/helpers/db';
import { getSchool } from '../database/repositories/schools.repo';
import { IUser } from '../database/modelInterfaces';
import { QueryRunner } from 'typeorm';
import { saveTransaction } from '../database/repositories/transaction.repo';

export const Service: any = {
  /**
   * A Function that create wallet
   * @param payload this is the request dataTransferObject  [[createDollarWalletDTO]]
   * @returns an error response | a success message using [[ControllerResponse]]
   * ``createDollarWalletSchema`` for Validation
   * [[findCurrency]] is used to fetch a currency.
   * [[findWallet]] is used to fetch a wallet.
   * [[generateUniquePaymentId]] is used to generate unique payment id.
   * [[createWallet]] is used to create partial wallet.
   * [[sendObjectResponse]] is used for sending success response.
   * [[BadRequestException]] is used for sending error response.
   * @engineer  Daniel Adegoke(Created), Emmanuel Akinjole(Updated)
   */
  async createDollarWallet({ user, currency = 'UGX', type = 'permanent', entity = 'school', entityId }: any): Promise<ControllerResponse> {
    // const schema = joi.object(createDollarWalletSchema).and('currency', 'type');
    // const validation = schema.validate({ userMobile, firstName, lastName, type, currency });

    // if (validation.error) return BadRequestException(validation.error.message);

    let currencyRes: any;
    if (currency) {
      currencyRes = await findCurrency({ short_code: currency }, ['short_code']);
      if (!currencyRes) return BadRequestException(`Currency doesn't exists`);
    }

    const wallet = await WalletREPO.findWallet({ userId: user.id, ...(type && { type }), ...(currency && { currency }) }, [
      'userId',
      'type',
      'currency',
    ]);

    if (wallet) return BadRequestException('Wallet already exists');

    // todo: create unique wallet ID based on the primary key columns
    // const uniquePaymentId = await generateUniquePaymentId({
    //   userMobile,
    //   firstName,
    //   lastName,
    //   type,
    // });

    await WalletREPO.createWallet({
      userId: user.id,
      uniquePaymentId: randomstring.generate({ length: 10, capitalization: 'lowercase', charset: 'alphanumeric' }),
      currency: currencyRes.short_code || 'UGX',
      entityId,
      entity,
      type,
    });

    return sendObjectResponse('Account successfully created');
  },

  async setWalletPin(user: IUser, transactionPin: string, type?: 'permanent' | 'temporary'): Promise<ControllerResponse> {
    // const schema = joi.object(setWalletPinSchema);
    // const validation = schema.validate({ userMobile, transactionPin, type });

    // if (validation.error) {
    //   return {
    //     success: false,
    //     error: validation.error.message,
    //   };
    // }

    const t = await getQueryRunner();
    try {
      const walletArray = await WalletREPO.findWallets(
        { userId: user.id, type: type || 'permanent', entity: 'school' },
        ['id', 'transaction_pin'],
        t,
      );
      if (walletArray.length === 0) {
        await t.rollbackTransaction();
        return {
          success: false,
          error: 'There is no wallet with this phone number.',
        };
      }

      const walletHolder: { wallet_id: number; pin: string }[] = [];
      walletArray.map((wallet) => {
        walletHolder.push({ wallet_id: wallet.id, pin: wallet.transaction_pin });
      });

      const allWalletsHavePin = walletHolder.find((wallet) => !wallet.pin);

      if (!allWalletsHavePin) {
        await t.rollbackTransaction();
        return {
          success: false,
          error: 'Transaction PIN is already set.',
        };
      }

      await Promise.all(
        walletHolder.map((wallet) => {
          const thePin = walletHolder.find((walletWithPin) => walletWithPin.pin);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          WalletREPO.updateWalletTransactionPin({ walletId: wallet.wallet_id, pin: bcrypt.hashSync(transactionPin, 10), t });
        }),
      );
      await t.commitTransaction();

      return {
        success: true,
        message: 'Successfully updated PIN.',
      };
    } catch (error) {
      await t.rollbackTransaction();
      throw error;
    } finally {
      await t.release();
    }
  },

  async getSchoolWallet(payload: any): Promise<ControllerResponse> {
    // const schema = joi.object(getWalletsWithUsernameAndPhoneSCHEMA);
    // const validation = schema.validate(payload);
    // if (validation.error) return BadRequestException(validation.error.message);

    // TODO :- CHANGE WALLET DETAIL
    const { user, type, t } = payload;

    const school = await getSchool({ organisation_id: user.organisation }, []);
    if (!school) throw Error(`School not found`);

    const relation = [];
    if (!t && type === 'fetchWallet') relation.push('User');
    const wallet = await WalletREPO.findWallet(
      {
        // username, userMobile, type || 'user'
        userId: user.id,
        entity: 'school',
        entity_id: school.id,
      },
      [],
      t && t,
      relation,
    );

    // const ConvertedWalletCase = await Promise.all(wallets.map(async (wallet) => toCamelCase(await getFlutterwaveAccountWithWalletInfo(wallet))));

    return sendObjectResponse('School wallet retrieved successfully', wallet);
  },

  async updateWalletPin({
    user,
    oldPin,
    newPin,
    type = 'permanent',
  }: {
    user: IUser;
    oldPin: string;
    newPin: string;
    type?: 'permanent' | 'temporary';
  }): Promise<ControllerResponse> {
    // const schema = joi.object(updateWalletPinSchema);
    // const validation = schema.validate({ userMobile, oldPin, newPin, type });

    // if (validation.error) {
    //   return {
    //     success: false,
    //     error: validation.error.message,
    //   };
    // }

    const t = await getQueryRunner();
    try {
      const walletArray = await WalletREPO.findWallets({ userId: user.id, type }, ['id', 'transaction_pin'], t);
      if (walletArray.length === 0) {
        return {
          success: false,
          error: 'There is no wallet for this user.',
        };
      }
      const allWalletsHavePin = walletArray.find((wallet) => !wallet.transaction_pin);
      if (allWalletsHavePin) {
        await t.rollbackTransaction();
        return {
          success: false,
          error: 'Please set transaction PIN before attempting to update.',
        };
      }

      const walletHolder: { wallet_id: number; pin: string }[] = [];
      walletArray.map((wallet) => {
        if (!bcrypt.compareSync(oldPin, wallet.transaction_pin)) walletHolder.push({ wallet_id: wallet.id, pin: wallet.transaction_pin });
      });

      if (walletHolder.length > 1) {
        await t.rollbackTransaction();
        return {
          success: false,
          error: 'Provided PIN is incorrect',
        };
      }

      await Promise.all(
        walletArray.map((wallet) => {
          WalletREPO.updateWalletTransactionPin({ walletId: wallet.id, pin: bcrypt.hashSync(newPin, 10), t });
        }),
      );

      await t.commitTransaction();

      return {
        success: true,
        message: 'Successfully updated PIN.',
      };
    } catch (error) {
      await t.rollbackTransaction();
      throw error;
    } finally {
      await t.release();
    }
  },

  async creditWallet({
    amount,
    user,
    wallet_id,
    purpose = 'Funding:Wallet',
    reference = v4(),
    description,
    metadata,
    t,
  }: {
    amount: number;
    user: IUser;
    wallet_id: number;
    purpose: string;
    reference?: string;
    description: string;
    metadata: { [key: string]: number | string };
    t: QueryRunner;
  }): Promise<ControllerResponse> {
    const wallet = await WalletREPO.findWallet({ userId: user.id, id: wallet_id }, ['id', 'balance'], t);
    if (!wallet) {
      return {
        success: false,
        error: 'Wallet does not exist',
      };
    }
    await WalletREPO.incrementBalance(wallet.id, amount, t);
    await saveTransaction({
      walletId: wallet.id,
      userId: user.id,
      amount,
      balance_after: Number(wallet.balance) + Number(amount),
      balance_before: Number(wallet.balance),
      purpose,
      metadata,
      reference,
      description,
      txn_type: 'credit',
      t,
    });
    // await checkIfDebtExistOnWallet({ walletId: wallet.id });
    return {
      success: true,
      message: 'Successfully credited wallet',
    };
  },
};
