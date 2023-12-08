import express from 'express';
import { catchErrors } from '../../utils/errors';
import { getAddressCONTROLLER } from '../../controllers/address.controller';
import { viewAllBusinessCONTROLLER } from '../../controllers/business.controller';
import { countriesCONTROLLER } from '../../controllers/miscillaneous.controller';
import { viewAllProductCategoriesCONTROLLER, viewAllProductCONTROLLER } from '../../controllers/product.controller';
import {
  allBusinessAndProductsCONTROLLER,
  getGuardianWardCONTROLLER,
  getPartnershipScholarshipCONTROLLER,
  getPublicSchoolCONTROLLER,
  getScholarshipsCONTROLLER,
  getInvitedOfficerCONTROLLER,
} from '../../controllers/public.controller';
import { addSponsorsCONTROLLER, getScholarshipCONTROLLER, scholarshipApplicationCONTROLLER } from '../../controllers/scholarship.controller';

const router = express.Router();

// router.get('/', allBusinessAndProductsCONTROLLER);
// router.get('/countries', countriesCONTROLLER);
// router.get('/partner/:slug', getPartnershipScholarshipCONTROLLER);
// router.get('/scholarship', getScholarshipsCONTROLLER);
// router.get('/scholarship/:code', getScholarshipCONTROLLER);
// router.post('/scholarship/:code/apply', scholarshipApplicationCONTROLLER);
// router.post('/scholarship/:code/sponsor', addSponsorsCONTROLLER);
// router.get('/products/:business', viewAllProductCONTROLLER);
// router.get('/category', viewAllProductCategoriesCONTROLLER);
// router.get('/address/:business', getAddressCONTROLLER);
// router.get('/business', viewAllBusinessCONTROLLER);
router.get('/:code', catchErrors(getPublicSchoolCONTROLLER));
router.get('/:code/:username', catchErrors(getGuardianWardCONTROLLER));
router.get('/:code/director/:username', catchErrors(getInvitedOfficerCONTROLLER));
router.post('/:code/director/:username', catchErrors(getInvitedOfficerCONTROLLER));

export default router;
