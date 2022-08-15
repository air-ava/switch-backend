import dateFormat from 'dateformat';
import { endOfDay } from 'date-fns';
import { LessThan, Like, Not } from 'typeorm';
import { getOneBuinessREPO } from '../database/repositories/business.repo';
import { createAndGetProductREPO, getProductesREPO } from '../database/repositories/product.repo';
import { createProductDTO, viewAllProductDTO } from '../dto/product.dto';
import { ResourceNotFoundError, sendObjectResponse, BadRequestException } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { randomstringGeenerator } from '../utils/utils';
import { createProductValidator, viewAllProductValidator } from '../validators/product.validator';
import { findOrCreateImage } from './helper.service';
import { getProductCategoriesREPO } from '../database/repositories/productCategory.repo';

export const createProduct = async (data: createProductDTO): Promise<theResponse> => {
  const validation = createProductValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { quantity = 1, images, name, business, publish = true, unlimited = false, ...rest } = data;
  const reference = randomstringGeenerator('product');
  const imageRef = randomstringGeenerator('image');

  try {
    const businessAlreadyExist = await getOneBuinessREPO({ reference: business }, [], []);
    if (!businessAlreadyExist) throw Error('Sorry, you can not create a product for this business');

    // can not create a product for with same name, price, business, description, category
    const product = await createAndGetProductREPO({
      name,
      ...rest,
      business: Number(businessAlreadyExist.id),
      publish,
      unlimited,
      reference,
      image_reference: imageRef,
      quantity,
    });
    await Promise.all(
      images.map(async (image: any) => {
        await findOrCreateImage({ url: image, table_type: 'product', table_id: product.id, reference: imageRef });
      }),
    );

    return sendObjectResponse('Product created successfully', product);
  } catch (e: any) {
    console.log({ e });
    return BadRequestException('Product creation failed, kindly try again');
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

export const viewAllProductCategories = async (): Promise<theResponse> => {
  try {
    const products = await getProductCategoriesREPO({}, []);

    return sendObjectResponse('Products categories retrieved successfully', products);
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message || 'Products categories retrieval failed, kindly try again');
  }
};
