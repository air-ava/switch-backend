import { RequestHandler } from 'express';
import { AFRICA_TALKING_USSD_TOKEN } from '../utils/secrets';

export const africasTalkingCONTROLLER: RequestHandler = async (req, res): Promise<void> => {
  res.set('Content-Type: text/plain');
  try {
    // check token here
    // if (req.query.token !== AFRICA_TALKING_USSD_TOKEN) throw Error('Inavlid token supplied');
    const { phoneNumber, serviceCode, text, sessionId, networkCode } = req.body;
    const response = `CON Welcome to Steward School Fees Payment
        Enter Student Code`;
    res.status(200).send(response).end();
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, error }).end();
  }
};
