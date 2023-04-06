import { STATUSES } from '../database/models/status.model';
import { getOneOrganisationREPO, updateOrganisationREPO } from '../database/repositories/organisation.repo';
import { sendObjectResponse, BadRequestException } from '../utils/errors';
import { theResponse } from '../utils/interface';

export const getPartnership = async (slug: string): Promise<any> => {
  try {
    const existingCompany = await getOneOrganisationREPO({ slug }, [], ['Status', 'LogoId', 'Owner', 'Scholarships', 'phone']);
    if (!existingCompany) throw Error('Sorry, no business has been created');

    return sendObjectResponse('Business retrieved successfully', existingCompany);
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message || 'Business retrieval failed, kindly try again');
  }
};

export const backOfficeVerifiesOrganisation = async (data: any): Promise<theResponse> => {
  // const validation = verifyUserValidator.validate(data);
  // if (validation.error) return ResourceNotFoundError(validation.error);

  const { id } = data;
  try {
    const existingCompany = await getOneOrganisationREPO({ id }, [], []);
    if (!existingCompany) throw Error(`Business not found`);

    await updateOrganisationREPO({ id }, { status: STATUSES.VERIFIED });

    return sendObjectResponse('Organisation verified');
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message);
  }
};
// 'Owner', 'Scholarship',
