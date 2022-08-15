import { BadRequestException, ResourceNotFoundError, sendObjectResponse } from '../utils/errors';
import { theResponse } from '../utils/interface';
import { createAddressValidator, getAddressValidator } from '../validators/address.validator';
import { createAddressDTO, getAddressDTO } from '../dto/address.dto';
import { businessChecker, findOrCreateAddress, updateAddressDefault } from './helper.service';
import { IBusiness } from '../database/modelInterfaces';
import { getAddressesREPO } from '../database/repositories/address.repo';
import { getOneBuinessREPO } from '../database/repositories/business.repo';

export const createAddress = async (data: createAddressDTO): Promise<theResponse> => {
  const validation = createAddressValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { street, country, state, city, default: isDefault, is_business, reference: businessReference, userId } = data;

  try {
    const business = is_business && (await businessChecker({ reference: businessReference, owner: Number(userId) }));

    const businessId = ((business as theResponse).data as IBusiness).id;
    const address = await findOrCreateAddress({
      street,
      country,
      state,
      city,
      ...(!is_business && { shopper: userId }),
      ...(is_business && { business: businessId }),
      ...(isDefault && { default: isDefault }),
    });

    return sendObjectResponse(address.message || 'Address created successfully', address.data);
  } catch (error: any) {
    console.log(error);
    return BadRequestException(error.message || 'Address creation failed, kindly try again');
  }
};

export const getAddress = async (data: getAddressDTO): Promise<theResponse> => {
  const validation = getAddressValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { reference, owner: shopper, public: publicUrl } = data;
  try {
    let business;
    if (reference) {
      business = await getOneBuinessREPO({ reference }, []);
      console.log({ business, reference, data });

      if (!business) throw Error('Sorry, can not find this business');
    }

    const address = await getAddressesREPO(
      {
        ...(reference && { business: business.id }),
        ...(shopper && { shopper }),
        ...(publicUrl && { default: publicUrl }),
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
