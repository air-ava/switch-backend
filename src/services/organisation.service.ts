import { getOneOrganisationREPO } from '../database/repositories/organisation.repo';
import { sendObjectResponse, BadRequestException } from '../utils/errors';

export const getPartnership = async (slug: string): Promise<any> => {
  try {
    const existingCompany = await getOneOrganisationREPO({ slug }, [], ['Status', 'LogoId', 'Owner', 'Scholarships', 'phone']);
    console.log({ existingCompany });
    if (!existingCompany) throw Error('Sorry, no business has been created');

    return sendObjectResponse('Business retrieved successfully', existingCompany);
  } catch (e: any) {
    console.log({ e });
    return BadRequestException(e.message || 'Business retrieval failed, kindly try again');
  }
};
// 'Owner', 'Scholarship',
