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

  async findWallet(
    queryParam: Partial<IWallets | any>,
    selectOptions: Array<keyof Wallets>,
    t?: QueryRunner,
    relationOptions?: any[],
  ): Promise<Wallets | undefined | any> {
    return t
      ? t.manager.findOne(Wallets, {
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['transaction_pin', 'uniquePaymentId']) }),
          lock: { mode: 'pessimistic_write' },
        })
      : getRepository(Wallets).findOne({
          where: queryParam,
          ...(selectOptions.length && { select: selectOptions.concat(['transaction_pin', 'uniquePaymentId']) }),
          ...(relationOptions && { relations: relationOptions }),
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

  async updateWalletStatus({ queryParams, status, t }: { queryParams: Partial<IWallets>; status: number; t?: QueryRunner }): Promise<UpdateResult> {
    const repository = t ? t.manager.getRepository(Wallets) : getRepository(Wallets);
    return repository.update(queryParams, { status });
  },

  async updateWalletTransactionPin({ walletId, pin, t }: { walletId: number; pin: string; t?: QueryRunner }): Promise<UpdateResult> {
    return t
      ? t.manager.update(Wallets, { id: walletId }, { transaction_pin: pin })
      : getRepository(Wallets).update({ id: walletId }, { transaction_pin: pin });
  },

  async incrementBalance(id: number, amount: number, t?: QueryRunner): Promise<UpdateResult> {
    return t ? t.manager.increment(Wallets, { id }, 'balance', amount) : getRepository(Wallets).increment({ id }, 'balance', amount);
  },

  async decrementBalance(id: number, amount: number, t?: QueryRunner): Promise<UpdateResult> {
    return t ? t.manager.decrement(Wallets, { id }, 'balance', amount) : getRepository(Wallets).decrement({ id }, 'balance', amount);
  },

  async incrementLedgerBalance(id: number, amount: number, t?: QueryRunner): Promise<UpdateResult> {
    return t ? t.manager.increment(Wallets, { id }, 'ledger_balance', amount) : getRepository(Wallets).increment({ id }, 'ledger_balance', amount);
  },

  async decrementLedgerBalance(id: number, amount: number, t?: QueryRunner): Promise<UpdateResult> {
    return t ? t.manager.decrement(Wallets, { id }, 'ledger_balance', amount) : getRepository(Wallets).decrement({ id }, 'ledger_balance', amount);
  },
};
