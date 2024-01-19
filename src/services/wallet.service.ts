/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable array-callback-return */
import randomstring from 'randomstring';
import { v4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Not, QueryRunner } from 'typeorm';
import { findCurrency } from '../database/repositories/curencies.repo';
import { BadRequestException, NotFoundError, sendObjectResponse } from '../utils/errors';
import { ControllerResponse, theResponse } from '../utils/interface';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import ReservedAccountREPO from '../database/repositories/reservedAccount.repo';
import { getQueryRunner } from '../database/helpers/db';
import { getSchool } from '../database/repositories/schools.repo';
import { IUser } from '../database/modelInterfaces';
import { saveTransaction } from '../database/repositories/transaction.repo';
import { STATUSES } from '../database/models/status.model';
import Settings from './settings.service';
import { sumOfArray } from '../utils/utils';
import { countryMapping } from '../database/models/users.model';
import { CURRENCIES } from '../database/models/currencies.model';

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
  async createDollarWallet(data: any): Promise<ControllerResponse> {
    const { user, type = 'permanent', entity = 'school', entityId } = data;

    const country = user.country.length === 2 ? countryMapping[user.country] : user.country;
    const { currency = CURRENCIES[country.toUpperCase()] || 'UGX' } = data;
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
      uniquePaymentId: randomstring.generate({ length: 10, charset: 'numeric' }),
      currency: currencyRes.short_code || currency || 'UGX',
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
          error: 'There is no wallet belonging to this user',
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
    if (!t && type === 'fetchWallet')
      wallet.ReservedAccount = await ReservedAccountREPO.getReservedAccount({ entity: 'school', entity_id: school.id }, []);

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
    purpose = 'Funding:Wallet-Top-Up',
    reference = v4(),
    description,
    metadata,
    channel,
    t,
    noTransaction = false,
  }: {
    amount: number;
    user: IUser;
    wallet_id: number;
    purpose: string;
    reference?: string;
    channel?: string;
    description: string;
    metadata: { [key: string]: number | string };
    t: QueryRunner;
    noTransaction: boolean;
  }): Promise<ControllerResponse> {
    const wallet = await WalletREPO.findWallet({ userId: user.id, id: wallet_id }, ['id', 'balance'], t);
    if (!wallet) {
      return {
        success: false,
        error: 'Wallet does not exist',
      };
    }
    await WalletREPO.incrementBalance(wallet.id, amount, t);
    if (!noTransaction)
      await saveTransaction({
        walletId: wallet.id,
        userId: user.id,
        amount,
        balance_after: Number(wallet.balance) + Number(amount),
        balance_before: Number(wallet.balance),
        purpose,
        ...(channel && { channel }),
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

  async debitWallet({
    amount,
    user,
    wallet_id,
    purpose = 'Withdraw:Wallet-Cash-Out',
    reference = v4(),
    description,
    metadata,
    channel,
    status,
    transactionPin,
    t,
  }: {
    amount: number;
    user: IUser;
    wallet_id: number;
    purpose: string;
    reference?: string;
    description: string;
    channel?: string;
    status?: number;
    metadata: { [key: string]: number | string };
    transactionPin?: string;
    t: QueryRunner;
  }): Promise<ControllerResponse> {
    const wallet = await WalletREPO.findWallet(
      { status: Not(STATUSES.DELETED), userId: user.id, id: wallet_id },
      ['id', 'balance', 'transaction_pin'],
      t,
    );
    if (!wallet) {
      return {
        success: false,
        error: 'Wallet does not exist',
      };
    }
    if (transactionPin && !wallet.transaction_pin) {
      return {
        success: false,
        error: 'Please set transaction PIN.',
      };
    }

    if (transactionPin && !bcrypt.compareSync(transactionPin, wallet.transaction_pin)) {
      return {
        success: false,
        error: 'Provided PIN is incorrect',
      };
    }

    if (Number(wallet.balance) < Number(amount)) {
      return {
        success: false,
        error: 'Insufficient balance',
      };
    }
    
    if (wallet.status === STATUSES.FREEZE) {
      return {
        success: false,
        error: 'Account is currenly frozen',
      };
    }

    // if (perTransactionLimit && Number(amount) > perTransactionLimit) {
    //   return {
    //     success: false,
    //     error: `Transaction exceeds limit by NGN ${numeral((Number(amount) - perTransactionLimit) / 100).format('0,0.00')}`,
    //   };
    // }
  
    // if (dailyLimit) {
    //   const [totalDebitsToday, totalReversalsToday] = await Promise.all([
    //     getTotalWalletTransactionsFromDate({
    //       walletId: wallet.id,
    //       startDate: startOfDay(new Date()),
    //     }),
    //     getTotalReversalsFromDate({ walletId: wallet.id, startDate: startOfDay(new Date()) }),
    //   ]);
    //   if (Number(amount) + Number(totalDebitsToday?.total) - Number(totalReversalsToday?.total) > dailyLimit)
    //     return {
    //       success: false,
    //       error: `Transaction exceeds daily limit by NGN ${numeral(
    //         (Number(amount) + Number(totalDebitsToday?.total) - Number(totalReversalsToday?.total) - dailyLimit) / 100,
    //       ).format('0,0.00')}`,
    //     };
    // }

    await WalletREPO.decrementBalance(wallet.id, Number(amount), t);

    await saveTransaction({
      walletId: wallet.id,
      userId: user.id,
      amount,
      balance_after: Number(wallet.balance) - Number(amount),
      balance_before: Number(wallet.balance),
      purpose,
      channel,
      status,
      metadata,
      reference,
      description,
      txn_type: 'debit',
      t,
    });
    return {
      success: true,
      message: 'Transfer successful',
    };
  },

  async debitTransactionFees({
    wallet_id,
    reference,
    user,
    description,
    feesNames,
    transactionAmount,
    t,
  }: {
    wallet_id: number;
    reference: string;
    user: IUser;
    description: string;
    feesNames: string[];
    transactionAmount: number;
    t?: QueryRunner;
  }): Promise<ControllerResponse> {
    const { allFees, arrayOfFees } = await Service.getAllFees(transactionAmount, feesNames);
    const checkArray = [];
    const checkArrayError = [];
    for (let index = 0; index < arrayOfFees.length; index++) {
      const { purpose, fee: amount } = arrayOfFees[index];
      const debitedWalletResponse = await Service.debitWallet({
        user,
        description,
        purpose,
        amount,
        reference,
        wallet_id,
        ...(t && { t }),
      });
      checkArray.push(debitedWalletResponse.success);
      if (debitedWalletResponse.success) checkArrayError.push(debitedWalletResponse.error);
    }
    if (!checkArray.includes(true)) return { success: false, error: checkArrayError[0] };
    return sendObjectResponse('message', allFees);
  },

  async getAllFees(transactionAmount: number, feesNames: string[]): Promise<any> {
    // const { transactionAmount, feesNames } = data;
    const feesConfig = Settings.get('TRANSACTION_FEES');
    const arrayOfFees = await Promise.all(
      feesNames.map((fee) => {
        return Service.generateFee(feesConfig[fee], transactionAmount);
      }),
    );
    const allFees = sumOfArray(arrayOfFees, 'fee');
    return {
      allFees: allFees || 0,
      arrayOfFees: arrayOfFees || [],
    };
  },

  async generateFee(
    feeConfig: {
      purpose: string;
      percent?: number;
      ceiling?: number;
      floor?: number;
      flat?: number;
    },
    amount: number,
  ): Promise<{ purpose: string; fee: number }> {
    const { purpose, percent, ceiling, floor, flat } = feeConfig;

    let fee = 0;
    if (percent) {
      fee = (Number(percent) / 100) * Number(amount);
      if (floor && fee < floor) fee = floor;
      if (ceiling && fee > ceiling) fee = ceiling;
      return { purpose, fee };
      // return ;
    }
    if (flat) fee = flat;
    return { purpose, fee };
  },

  async freezeWallet(data: any): Promise<any> {
    const { uniquePaymentId, freeze } = data;
    const status = freeze ? STATUSES.FREEZE : STATUSES.ACTIVE;
    const wallet = await WalletREPO.findWallet({ status: Not(STATUSES.DELETED), uniquePaymentId }, ['id', 'balance', 'transaction_pin']);
    if (!wallet) throw new NotFoundError('Wallet');

    await WalletREPO.updateWalletStatus({ queryParams: { uniquePaymentId }, status });
    return sendObjectResponse(freeze ? 'Wallet Frozen' : 'Wallet Unfrozen', wallet);
  },
};
