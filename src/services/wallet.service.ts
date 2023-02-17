import randomstring from 'randomstring';
import * as bcrypt from 'bcrypt';
import { findCurrency } from '../database/repositories/curencies.repo';
import { BadRequestException, sendObjectResponse } from '../utils/errors';
import { ControllerResponse } from '../utils/interface';
import { Repo as WalletREPO } from '../database/repositories/wallet.repo';
import { getQueryRunner } from '../database/helpers/db';
import { getSchool } from '../database/repositories/schools.repo';

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

  async setWalletPin(userMobile: string, transactionPin: string, type?: 'business' | 'user'): Promise<ControllerResponse> {
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
      const walletArray = await WalletREPO.findWallets({ user_mobile: userMobile, type: type || 'user' }, ['id', 'transaction_pin'], t);
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
    const { user } = payload;

    const school = await getSchool({ organisation_id: user.organisation }, []);
    if (!school) throw Error(`School not found`);

    const wallet = await WalletREPO.findWallet(
      {
        // username, userMobile, type || 'user'
        userId: user.id,
        entity: 'school',
        entity_id: school.id,
      },
      [],
    );

    // const ConvertedWalletCase = await Promise.all(wallets.map(async (wallet) => toCamelCase(await getFlutterwaveAccountWithWalletInfo(wallet))));

    return sendObjectResponse('School wallet retrieved successfully', wallet);
  },
};
