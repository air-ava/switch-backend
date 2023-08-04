import { RequestHandler } from 'express';
import { AFRICA_TALKING_USSD_TOKEN } from '../utils/secrets';
import UssdService from '../services/ussd.service';
import Settings from '../services/settings.service';

export const africasTalkingCONTROLLER: RequestHandler = async (req, res): Promise<void> => {
  res.set('Content-Type: text/plain');
  try {
    // check token here
    if (req.query.token !== AFRICA_TALKING_USSD_TOKEN) throw Error('Inavlid token supplied');
    const { serviceCode } = req.body;
    const ussdServiceCodes = Settings.get('USSD');
    let response;
    switch (serviceCode) {
      case ussdServiceCodes.serviceCode:
        response = await UssdService.sessionHandler(req.body);
        break;
      case ussdServiceCodes.schoolServiceCode:
        response = await UssdService.schoolSessionHandler(req.body);
        break;
      default:
        response = { success: false, error: 'END Invalid ussd code' };
    }
    // const response = await UssdService.sessionHandler(req.body);
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
