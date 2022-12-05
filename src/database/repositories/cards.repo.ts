import { getRepository, InsertResult, QueryRunner, UpdateResult } from 'typeorm';
import { ICard } from '../modelInterfaces';
import { Cards } from '../models/cards.model';
import { STATUSES } from '../models/status.model';

export const fetchCard = (queryParam: Partial<ICard>, selectOptions: Array<keyof Cards>, t?: QueryRunner): Promise<Cards | undefined> => {
  return t
    ? t.manager.findOne(Cards, { where: queryParam, ...(selectOptions.length && { select: selectOptions }) })
    : getRepository(Cards).findOne({ where: queryParam, ...(selectOptions.length && { select: selectOptions }) });
};

export const fetchCards = (queryParam: Partial<ICard>, selectOptions: Array<keyof Cards>, t?: QueryRunner): Promise<Array<Cards>> => {
  return t
    ? t.manager.find(Cards, { where: queryParam, ...(selectOptions.length && { select: selectOptions }) })
    : getRepository(Cards).find({ where: queryParam, ...(selectOptions.length && { select: selectOptions }) });
};

export const saveCard = (queryParams: Omit<ICard, 'id' | 'created_at' | 'deleted' | 'deleted_at'>, t?: QueryRunner): Promise<InsertResult> => {
  return t ? t.manager.insert(Cards, queryParams) : getRepository(Cards).insert(queryParams);
};

export const changeCardDefaultStatus = (cardId: number, changeTo: boolean, t?: QueryRunner): Promise<UpdateResult> => {
  return t ? t.manager.update(Cards, { id: cardId }, { default: changeTo }) : getRepository(Cards).update({ id: cardId }, { default: changeTo });
};

export const deleteCard = (cardId: number, t?: QueryRunner): Promise<UpdateResult> => {
  return t
    ? t.manager.update(Cards, { id: cardId }, { status: STATUSES.DELETED })
    : getRepository(Cards).update({ id: cardId }, { status: STATUSES.DELETED });
};
