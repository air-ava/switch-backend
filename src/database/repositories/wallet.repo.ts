import { QueryRunner, InsertResult, getRepository, UpdateResult } from 'typeorm';
import { Wallets } from '../models/wallets.model';
import { IWallets } from '../modelInterfaces';

export const Repo = {
  /**
   * A Repo function that create wallet.
   * @param payload this is the data needed to create a wallet.
   * @returns an inserted result [[InsertResult]]
   * @engineer Adebayo Opesanya(Created), Joyce Odenma(Updated), Daniel Adegoke(Updated), Emmanuel Akinjole(Updated)
   */
  async createWallet(payload: {
    userId: string;
    entity?: string;
    entityId: string;
    uniquePaymentId: string;
    currency?: string;
    type?: 'temporary' | 'permanent';
    t?: QueryRunner;
  }): Promise<InsertResult> {
    const { userId, uniquePaymentId, currency, type, entity, entityId: entity_id, t } = payload;
    return t
      ? t.manager.insert(Wallets, {
          userId,
          uniquePaymentId,
          entity_id,
          entity,
          ...(currency && { currency }),
          ...(type && { type }),
        })
      : getRepository(Wallets).insert({
          userId,
          uniquePaymentId,
          entity_id,
          entity,
          ...(currency && { currency }),
          ...(type && { type }),
        });
  },

  async findWallet(queryParam: Partial<IWallets | any>, selectOptions: Array<keyof Wallets>, t?: QueryRunner): Promise<Wallets | undefined | any> {
    return t
      ? t.manager.findOne(Wallets, {
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['transaction_pin', 'uniquePaymentId']) }),
          lock: { mode: 'pessimistic_write' },
        })
      : getRepository(Wallets).findOne({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['transaction_pin', 'uniquePaymentId']) }),
        });
  },

  async findWallets(queryParam: Partial<IWallets | any>, selectOptions: Array<keyof Wallets>, t?: QueryRunner): Promise<Wallets[]> {
    return t
      ? t.manager.find(Wallets, {
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['transaction_pin', 'uniquePaymentId']) }),
          lock: { mode: 'pessimistic_write' },
        })
      : getRepository(Wallets).find({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['transaction_pin', 'uniquePaymentId']) }),
        });
  },

  async updateWalletTransactionPin({ walletId, pin, t }: { walletId: number; pin: string; t?: QueryRunner }): Promise<UpdateResult> {
    return t
      ? t.manager.update(Wallets, { id: walletId }, { transaction_pin: pin })
      : getRepository(Wallets).update({ id: walletId }, { transaction_pin: pin });
  },
  
  // async updateWalletTransactionPin({ walletId, pin, t }: { walletId: number; pin: string; t?: QueryRunner }): Promise<UpdateResult> {
  //   return t
  //     ? t.manager.update(Wallets, { id: walletId }, { transaction_pin: pin })
  //     : getRepository(Wallets).update({ id: walletId }, { transaction_pin: pin });
  // },
};
