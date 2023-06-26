import express from 'express';
import {
  getNotificationContactsCONTROLLER,
  createNotificationConfigurationCONTROLLER,
  deletePhoneOrEmailCONTROLLER,
  updateConfigurationCONTROLLER,
} from '../controllers/preferences.controller';
import { catchErrors } from '../utils/errors';

const router = express.Router();

router.post('/preference', catchErrors(createNotificationConfigurationCONTROLLER));
router.get('/contacts', catchErrors(getNotificationContactsCONTROLLER));
router.delete('/contacts', catchErrors(deletePhoneOrEmailCONTROLLER));
router.patch('/contacts', catchErrors(updateConfigurationCONTROLLER));

export default router;
