import { RequestHandler } from 'express';
import { deliverOrder, getAddress, getOrder, getOrders, getTracker, makeOrderRequest, pickUpOrder, updateTracker } from '../controllers/order';
import { createUser, createAddress } from '../controllers/user';

export const makeOrder: RequestHandler = async (req, res) => {
  try {
    const response = await makeOrderRequest(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const pickUp: RequestHandler = async (req, res) => {
  try {
    const response = await pickUpOrder(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const deliver: RequestHandler = async (req, res) => {
  try {
    const response = await deliverOrder(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const Trackerupdate: RequestHandler = async (req, res) => {
  try {
    const response = await updateTracker(req.body);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const getOrderRequest: RequestHandler = async (req: any, res) => {
  try {
    console.log(req.query.reference);
    const response = await getOrder(req.query.reference);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const getTrackerRequest: RequestHandler = async (req: any, res) => {
  try {
    console.log(req.query.reference);
    const response = await getTracker(req.query.reference);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const getAddressRequest: RequestHandler = async (req: any, res) => {
  try {
    const response = await getAddress();
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};

export const getOrdersRequest: RequestHandler = async (req: any, res) => {
  try {
    console.log(req.query.user_id);
    const response = await getOrders(req.query.user_id);
    const responseCode = response.success === true ? 200 : 400;
    return res.status(responseCode).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
  }
};
