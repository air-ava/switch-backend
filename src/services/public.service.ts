import dateFormat from 'dateformat';
import { endOfDay } from 'date-fns';
import { LessThan, Not, Like } from 'typeorm';
import { getBusinessesREPO } from '../database/repositories/business.repo';
import { allBusinessAndProductsDTO } from '../dto/public.dto';
import { sendObjectResponse, BadRequestException, ResourceNotFoundError } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { allBusinessAndProductsValidator } from '../validators/public.validator';

export const allBusinessAndProducts = async (data: allBusinessAndProductsDTO): Promise<theResponse> => {
  const validation = allBusinessAndProductsValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { to, from, search, quantity } = data;

  const formattedTo = to && new Date(to);
  const formattedFrom = from && new Date(from);
  try {
    if (formattedFrom && formattedTo && formattedTo < formattedFrom) throw Error('Start date cannot be after end date');

    const query: any[] = [];
    query.push({
      active: true,
      ...(formattedTo && { created_at: LessThan(dateFormat(endOfDay(formattedTo), 'isoDateTime')) }),
      ...(formattedFrom && { created_at: Not(LessThan(dateFormat(formattedFrom, 'isoDateTime'))) }),
      ...(quantity && { quantity }),
    });

    if (search)
      query.push(
        { name: Like(`%${search}%`) },
        { description: Like(`%${search}%`) },
        { owners: { first_name: Like(`%${search}%`) } },
        { owners: { last_name: Like(`%${search}%`) } },
      );

    const existingCompany = await getBusinessesREPO(query, [], ['phone', 'owners', 'product']);
    if (existingCompany.length === 0) throw Error('Sorry, no business has been created');

    return sendObjectResponse('Business retrieved successfully', existingCompany);
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message || 'Business retrieval failed, kindly try again');
  }
};
