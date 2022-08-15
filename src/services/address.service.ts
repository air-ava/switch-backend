import { BadRequestException, ResourceNotFoundError, sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { createAddressValidator, getAddressValidator } from '../validators/address.validator';
import { createAddressDTO, getAddressDTO } from '../dto/address.dto';
import { businessChecker, findOrCreateAddress } from './helper.service';
import { IBusiness } from '../database/modelInterfaces';
import { getAddressesREPO } from '../database/repositories/address.repo';
import { getOneBuinessREPO } from '../database/repositories/business.repo';

export const createAddress = async (data: createAddressDTO): Promise<theResponse> => {
  const validation = createAddressValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { street, country, state, city, default: isDefault, is_business, reference: businessReference, userId } = data;

  try {
    const business = is_business && (await businessChecker({ reference: businessReference, owner: Number(userId) }));

    const address = await findOrCreateAddress({
      street,
      country,
      state,
      city,
      ...(!is_business && { shopper: userId }),
      ...(is_business && { business: ((business as theResponse).data as IBusiness).id }),
      default: isDefault,
    });
    return sendObjectResponse('Address created successfully', address);
  } catch (error: any) {
    console.log(error);
    return BadRequestException(error.messaage || 'Address creation failed, kindly try again');
  }
};

export const getAddress = async (data: getAddressDTO): Promise<theResponse> => {
  const validation = getAddressValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { reference, owner: shopper } = data;
  try {
    const business = await getOneBuinessREPO({ reference }, []);
    if (!business) throw Error('Sorry, can not find this business');

    const address = await getAddressesREPO(
      {
        ...(reference && { business: business.id }),
        ...(shopper && { shopper }),
      },
      [],
    );
    if (address.length === 0) throw Error('Sorry, no addresses available');

    return sendObjectResponse('Address retrieved successfully', address);
  } catch (error: any) {
    console.log(error);
    return BadRequestException(error.message || 'Address retrieval failed, kindly try again');
  }
};
