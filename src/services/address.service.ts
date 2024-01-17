import { BadRequestException, NotFoundError, ResourceNotFoundError, ValidationError, sendObjectResponse } from '../utils/errors';
import { Sanitizer } from '../utils/sanitizer';
import { theResponse } from '../utils/interface';
import { createAddressValidator, getAddressValidator, getStateDistrictsValidator, getStatesValidator } from '../validators/address.validator';
import { createAddressDTO, getAddressDTO } from '../dto/address.dto';
import { businessChecker, findOrCreateAddress, updateAddressDefault } from './helper.service';
import { IBusiness } from '../database/modelInterfaces';
import { getAddressesREPO } from '../database/repositories/address.repo';
import { getOneBuinessREPO } from '../database/repositories/business.repo';
import CountryStateRepo from '../database/repositories/countryState.repo';
import { STATUSES } from '../database/models/status.model';

export const createAddress = async (data: createAddressDTO | any): Promise<theResponse> => {
  const validation = createAddressValidator.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const { street, country, state, city, area, is_business, reference: businessReference, userId } = data;

  try {
    const business = is_business && (await businessChecker({ reference: businessReference, owner: Number(userId) }));

    const businessId = ((business as theResponse).data as IBusiness).id;
    const address = await findOrCreateAddress({
      street,
      country,
      state,
      city,
      area,
      status: STATUSES.ACTIVE,
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

const Service = {
  async getCountryStates(data: { country: 'NIGERIA' | 'UGANDA' }): Promise<theResponse> {
    const { country } = data;

    const validation = getStatesValidator.validate(data);
    if (validation.error) throw new ValidationError(validation.error.message);

    const states = { UGANDA: 'Regions', NIGERIA: 'States' };
    const gottenStates = await CountryStateRepo.listCountryStates({ country }, []);

    return sendObjectResponse(`${states[country]} retrieved successfully`, Sanitizer.sanitizeAllArray(gottenStates, Sanitizer.sanitizeNoId));
  },

  async getStatesDistricts(data: { country: 'NIGERIA' | 'UGANDA'; state: string }): Promise<theResponse> {
    const { country, state } = data;

    const validation = getStateDistrictsValidator.validate(data);
    if (validation.error) throw new ValidationError(validation.error.message);

    const states = { UGANDA: 'Regions', NIGERIA: 'States' };
    const districts = await CountryStateRepo.getCountryState({ country, state_district: state }, ['lga_cities']);
    if (!districts) throw new NotFoundError(`${states[country]}`);

    return sendObjectResponse(`${state} retrieved successfully`, districts.lga_cities ? districts.lga_cities.split(',') : []);
  },
};

export default Service;
