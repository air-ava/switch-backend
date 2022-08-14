import dateFormat from 'dateformat';
import { endOfDay } from 'date-fns';
import { LessThan, Like, Not } from 'typeorm';
import { getQueryRunner } from '../database/helpers/db';
import { getOneBuinessREPO } from '../database/repositories/business.repo';
import { createAndGetProductREPO, getProductesREPO } from '../database/repositories/product.repo';
import { createProductDTO, viewAllProductDTO } from '../dto/product.dto';
import { ResourceNotFoundError, sendObjectResponse, BadRequestException } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { randomstringGeenerator } from '../utils/utils';
import { createProductValidator, viewAllProductValidator } from '../validators/product.validator';
import { findOrCreateImage } from './helper.service';

export const createProduct = async (data: createProductDTO): Promise<theResponse> => {
  const validation = createProductValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { quantity = 1, weight = 1, images, name, business, publish = true, unlimited = false, ...rest } = data;
  const reference = randomstringGeenerator('product');
  const imageRef = randomstringGeenerator('image');

  const queryRunner = await getQueryRunner();
  try {
    await queryRunner.startTransaction();
    const businessAlreadyExist = await getOneBuinessREPO({ reference: business }, [], [], queryRunner);
    if (!businessAlreadyExist) throw Error('Sorry, you can not create a product for this business');

    const product = await createAndGetProductREPO(
      {
        name,
        ...rest,
        business: Number(businessAlreadyExist.id),
        publish,
        unlimited,
        reference,
        image_reference: imageRef,
        quantity,
        weight,
      },
      queryRunner,
    );
    await Promise.all(
      images.map(async (image: any) => {
        await findOrCreateImage({ url: image, table_type: 'product', table_id: product.id, reference: imageRef });
      }),
    );

    await queryRunner.commitTransaction();

    return sendObjectResponse('Product created successfully');
  } catch (e: any) {
    console.log({ e });

    await queryRunner.rollbackTransaction();
    return BadRequestException('Product creation failed, kindly try again');
  } finally {
    await queryRunner.release();
  }
};

export const viewAllProduct = async (data: viewAllProductDTO): Promise<theResponse> => {
  const validation = viewAllProductValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { business: reference, to, from, search, quantity } = data;

  const formattedTo = to && new Date(to);
  const formattedFrom = from && new Date(from);

  try {
    if (formattedFrom && formattedTo && formattedTo < formattedFrom) throw Error('Start date cannot be after end date');

    const existingCompany = await getOneBuinessREPO({ reference }, ['name', 'description', 'reference']);
    if (!existingCompany) throw Error('Sorry, we can not find this business');

    const query: any[] = [];
    query.push({
      business: existingCompany.id,
      ...(formattedTo && { created_at: LessThan(dateFormat(endOfDay(formattedTo), 'isoDateTime')) }),
      ...(formattedFrom && { created_at: Not(LessThan(dateFormat(formattedFrom, 'isoDateTime'))) }),
      ...(quantity && { quantity }),
    });

    if (search)
      query.push(
        { name: Like(`%${search}%`) },
        { description: Like(`%${search}%`) },
        { unit_price: Like(`%${search}%`) },
        {
          Category: {
            name: Like(`%${search}%`),
          },
        },
      );

    const products = await getProductesREPO(query, [], ['Category']);

    return sendObjectResponse('Products retrieved successfully', products);
  } catch (e: any) {
    console.log({
      e,
    });

    return BadRequestException(e.message || 'Products retrieval failed, kindly try again');
  }
};
