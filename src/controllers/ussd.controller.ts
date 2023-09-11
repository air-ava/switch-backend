import { RequestHandler } from 'express';
import { AFRICA_TALKING_USSD_TOKEN } from '../utils/secrets';
import UssdService from '../services/ussd.service';
import Settings from '../services/settings.service';

export const africasTalkingCONTROLLER: RequestHandler = async (req, res): Promise<void> => {
  res.set('Content-Type: text/plain');
  try {
    // check token here
    if (req.query.token !== AFRICA_TALKING_USSD_TOKEN) throw Error('Inavlid token supplied');
    const response = await UssdService.homePage(req.body);
    console.log({ response });
    res
      .status(200)
      .send(response.message || response.error)
      .end();
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, error }).end();
  }
};
